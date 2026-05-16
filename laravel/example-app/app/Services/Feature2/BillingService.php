<?php

namespace App\Services\Feature2;

use App\Models\CreditPackage;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class BillingService
{
    public function __construct(private readonly ?StripeClient $stripe = null)
    {
    }

    public static function make(): self
    {
        $secret = (string) config('services.stripe.secret');

        return new self($secret !== '' ? new StripeClient($secret) : null);
    }

    private function requireStripeClient(): StripeClient
    {
        if (! $this->stripe) {
            throw new \RuntimeException('Stripe is not configured.');
        }

        return $this->stripe;
    }

    public function ensureStripeCustomer(User $user): User
    {
        if ($user->stripe_customer_id) {
            return $user;
        }

        $stripe = $this->requireStripeClient();

        $customer = $stripe->customers->create([
            'email' => $user->email,
            'name' => $user->name,
            'metadata' => ['user_id' => (string) $user->id],
        ]);

        $user->update(['stripe_customer_id' => $customer->id]);

        return $user->refresh();
    }

    public function grantCredits(User $user, int $credits, array $transactionData = []): Transaction
    {
        return DB::transaction(function () use ($user, $credits, $transactionData) {
            $user = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $user->increment('credit_balance', $credits);

            return $user->transactions()->create(array_merge([
                'credit_package_id' => Arr::get($transactionData, 'credit_package_id'),
                'type' => Arr::get($transactionData, 'type', 'credit_purchase'),
                'description' => Arr::get($transactionData, 'description', 'Credit top-up'),
                'credits' => $credits,
                'amount' => Arr::get($transactionData, 'amount', 0),
                'status' => Arr::get($transactionData, 'status', 'completed'),
                'stripe_payment_intent_id' => Arr::get($transactionData, 'stripe_payment_intent_id'),
                'stripe_checkout_session_id' => Arr::get($transactionData, 'stripe_checkout_session_id'),
                'metadata' => Arr::get($transactionData, 'metadata'),
            ], Arr::only($transactionData, ['type', 'description', 'status'])));
        });
    }

    public function processAutoRecharge(User $user): ?Transaction
    {
        if (! $user->auto_recharge_enabled || ! $user->stripe_payment_method_id) {
            return null;
        }

        $package = CreditPackage::query()
            ->where('is_active', true)
            ->when($user->auto_recharge_package_id, fn ($query) => $query->where('id', $user->auto_recharge_package_id))
            ->orderBy('id')
            ->first();

        if (! $package) {
            return null;
        }

        $stripe = $this->requireStripeClient();
        $user = $this->ensureStripeCustomer($user);

        try {
            $intent = $stripe->paymentIntents->create([
                'amount' => (int) round(((float) $package->price) * 100),
                'currency' => config('services.stripe.currency', 'usd'),
                'customer' => $user->stripe_customer_id,
                'payment_method' => $user->stripe_payment_method_id,
                'off_session' => true,
                'confirm' => true,
                'metadata' => [
                    'purpose' => 'auto_recharge',
                    'user_id' => (string) $user->id,
                    'credit_package_id' => (string) $package->id,
                ],
            ]);
        } catch (ApiErrorException $e) {
            return null;
        }

        if (($intent->status ?? null) !== 'succeeded') {
            return null;
        }

        $existing = Transaction::where('stripe_payment_intent_id', $intent->id)->first();
        if ($existing) {
            return $existing;
        }

        return $this->grantCredits($user, (int) $package->credits, [
            'credit_package_id' => $package->id,
            'type' => 'auto_recharge',
            'description' => 'Auto recharge',
            'amount' => $package->price,
            'status' => 'completed',
            'stripe_payment_intent_id' => $intent->id,
            'metadata' => [
                'source' => 'auto_recharge',
                'stripe_customer_id' => $user->stripe_customer_id,
            ],
        ]);
    }
}
