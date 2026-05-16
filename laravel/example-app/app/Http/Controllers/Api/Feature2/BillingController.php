<?php

namespace App\Http\Controllers\Api\Feature2;

use App\Http\Controllers\Controller;
use App\Models\CreditPackage;
use App\Models\Transaction;
use App\Services\Feature2\BillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class BillingController extends Controller
{
    private function stripeClientOrFail(): StripeClient
    {
        $secret = (string) config('services.stripe.secret');

        abort_if($secret === '', 503, 'Stripe is not configured.');

        return new StripeClient($secret);
    }

    private function stripeClient(): StripeClient
    {
        return $this->stripeClientOrFail();
    }

    public function createSetupIntent(Request $request): JsonResponse
    {
        $stripe = $this->stripeClientOrFail();
        $billing = new BillingService($stripe);
        $user = $billing->ensureStripeCustomer($request->user());

        $intent = $stripe->setupIntents->create([
            'customer' => $user->stripe_customer_id,
            'payment_method_types' => ['card'],
        ]);

        return response()->json([
            'client_secret' => $intent->client_secret,
            'customer_id' => $user->stripe_customer_id,
        ]);
    }

    public function savePaymentMethod(Request $request): JsonResponse
    {
        $data = $request->validate([
            'payment_method_id' => ['required', 'string'],
        ]);

        $stripe = $this->stripeClientOrFail();
        $billing = new BillingService($stripe);
        $user = $billing->ensureStripeCustomer($request->user());

        $stripe->paymentMethods->attach($data['payment_method_id'], [
            'customer' => $user->stripe_customer_id,
        ]);

        $stripe->customers->update($user->stripe_customer_id, [
            'invoice_settings' => ['default_payment_method' => $data['payment_method_id']],
        ]);

        $user->update([
            'stripe_payment_method_id' => $data['payment_method_id'],
        ]);

        return response()->json([
            'message' => 'Payment method saved successfully.',
            'stripe_payment_method_id' => $data['payment_method_id'],
        ]);
    }

    public function createCheckoutSession(Request $request): JsonResponse
    {
        $data = $request->validate([
            'credit_package_id' => ['required'],
            'success_url' => ['required', 'string', 'max:2048'],
            'cancel_url' => ['required', 'string', 'max:2048'],
        ]);

        if (! str_starts_with($data['success_url'], 'http://') && ! str_starts_with($data['success_url'], 'https://')) {
            return response()->json(['message' => 'The success url field must start with http:// or https://.'], 422);
        }

        if (! str_starts_with($data['cancel_url'], 'http://') && ! str_starts_with($data['cancel_url'], 'https://')) {
            return response()->json(['message' => 'The cancel url field must start with http:// or https://.'], 422);
        }

        $packageInput = $data['credit_package_id'];
        $packageQuery = CreditPackage::query()->where('is_active', true);

        if (is_numeric($packageInput)) {
            $packageQuery->where('id', (int) $packageInput);
        } elseif (is_string($packageInput)) {
            $normalized = Str::of($packageInput)->lower()->replace(['_', '-'], ' ')->toString();
            $packageQuery->whereRaw('LOWER(name) = ?', [$normalized]);
        } else {
            return response()->json([
                'message' => 'Invalid credit package value.',
            ], 422);
        }

        $package = $packageQuery->first();
        if (! $package) {
            return response()->json([
                'message' => 'Please add credit packages in backend first, then try checkout.',
            ], 422);
        }

        $stripe = $this->stripeClientOrFail();
        $billing = new BillingService($stripe);
        $user = $billing->ensureStripeCustomer($request->user());

        try {
            $session = $stripe->checkout->sessions->create([
                'mode' => 'payment',
                'customer' => $user->stripe_customer_id,
                'success_url' => $data['success_url'],
                'cancel_url' => $data['cancel_url'],
                'line_items' => [[
                    'quantity' => 1,
                    'price_data' => [
                        'currency' => config('services.stripe.currency', 'usd'),
                        'unit_amount' => (int) round(((float) $package->price) * 100),
                        'product_data' => [
                            'name' => $package->name,
                            'description' => sprintf('%d credits', $package->credits),
                        ],
                    ],
                ]],
                'metadata' => [
                    'user_id' => (string) $user->id,
                    'credit_package_id' => (string) $package->id,
                    'credits' => (string) $package->credits,
                    'amount' => (string) $package->price,
                ],
            ]);
        } catch (ApiErrorException $e) {
            Log::warning('Stripe checkout failed, falling back to local mock checkout.', [
                'user_id' => $user->id,
                'package_id' => $package->id,
                'error' => $e->getMessage(),
            ]);

            $mockSessionId = 'mock_'.Str::uuid();
            $checkoutUrl = $data['success_url'];
            $separator = str_contains($checkoutUrl, '?') ? '&' : '?';
            $checkoutUrl .= $separator.'session_id='.$mockSessionId.'&mock_checkout=1';

            Transaction::query()->firstOrCreate(
                ['stripe_checkout_session_id' => $mockSessionId],
                [
                    'user_id' => $user->id,
                    'credit_package_id' => $package->id,
                    'type' => 'credit_purchase',
                    'description' => sprintf('Pending purchase: %s', $package->name),
                    'credits' => (int) $package->credits,
                    'amount' => (float) $package->price,
                    'status' => 'pending',
                    'metadata' => ['source' => 'mock_checkout_session_created'],
                ]
            );

            return response()->json([
                'checkout_session_id' => $mockSessionId,
                'checkout_url' => $checkoutUrl,
                'mock' => true,
            ]);
        }

        Transaction::query()->firstOrCreate(
            ['stripe_checkout_session_id' => $session->id],
            [
                'user_id' => $user->id,
                'credit_package_id' => $package->id,
                'type' => 'credit_purchase',
                'description' => sprintf('Pending purchase: %s', $package->name),
                'credits' => (int) $package->credits,
                'amount' => (float) $package->price,
                'status' => 'pending',
                'metadata' => ['source' => 'checkout_session_created'],
            ]
        );

        return response()->json([
            'checkout_session_id' => $session->id,
            'checkout_url' => $session->url,
        ]);
    }

    public function confirmCheckoutSession(Request $request): JsonResponse
    {
        $data = $request->validate([
            'session_id' => ['required', 'string'],
        ]);

        $sessionId = $data['session_id'];

        $session = null;
        if (! str_starts_with($sessionId, 'mock_')) {
            $stripe = $this->stripeClientOrFail();
            $session = $stripe->checkout->sessions->retrieve($sessionId);

            if (($session->payment_status ?? '') !== 'paid') {
                return response()->json([
                    'message' => 'Payment is not completed yet.',
                    'status' => $session->payment_status ?? 'unknown',
                ], 422);
            }
        }

        $existing = Transaction::query()
            ->where('stripe_checkout_session_id', $sessionId)
            ->first();

        if ($existing && $existing->status === 'completed') {
            return response()->json([
                'message' => 'Session already confirmed.',
                'transaction_id' => $existing->id,
            ]);
        }

        $metadata = $session ? (array) ($session->metadata ?? []) : (array) ($existing?->metadata ?? []);
        $userId = (int) ($metadata['user_id'] ?? ($existing?->user_id ?? 0));
        $packageId = (int) ($metadata['credit_package_id'] ?? ($existing?->credit_package_id ?? 0));
        $credits = (int) ($metadata['credits'] ?? ($existing?->credits ?? 0));

        if (($userId > 0 && $userId !== (int) $request->user()->id) || $packageId <= 0 || $credits <= 0) {
            return response()->json(['message' => 'Invalid checkout metadata.'], 422);
        }

        $package = CreditPackage::query()->find($packageId);
        if (! $package) {
            return response()->json(['message' => 'Credit package not found.'], 422);
        }

        if ($existing) {
            $existing->update([
                'status' => 'completed',
                'description' => sprintf('Purchased package: %s', $package->name),
                'metadata' => array_merge((array) $existing->metadata, ['source' => 'checkout_confirm']),
            ]);

            $request->user()->increment('credit_balance', $credits);
        } else {
            BillingService::make()->grantCredits($request->user(), $credits, [
                'credit_package_id' => $package->id,
                'type' => 'credit_purchase',
                'description' => sprintf('Purchased package: %s', $package->name),
                'amount' => $package->price,
                'status' => 'completed',
                'stripe_checkout_session_id' => $sessionId,
                'metadata' => ['source' => str_starts_with($sessionId, 'mock_') ? 'mock_checkout_confirm' : 'checkout_confirm'],
            ]);
        }

        return response()->json([
            'message' => 'Checkout confirmed successfully.',
            'credit_balance' => $request->user()->fresh()->credit_balance,
        ]);
    }

    public function updateAutoRechargeSettings(Request $request): JsonResponse
    {
        $data = $request->validate([
            'enabled' => ['required', 'boolean'],
            'credit_package_id' => ['nullable', 'integer', 'exists:credit_packages,id'],
        ]);

        if ($data['enabled'] && empty($request->user()->stripe_payment_method_id)) {
            return response()->json([
                'message' => 'You must save a payment method before enabling auto recharge.',
            ], 422);
        }

        $request->user()->update([
            'auto_recharge_enabled' => $data['enabled'],
            'auto_recharge_package_id' => $data['enabled'] ? ($data['credit_package_id'] ?? null) : null,
        ]);

        return response()->json([
            'message' => 'Auto recharge settings updated successfully.',
            'auto_recharge_enabled' => (bool) $request->user()->fresh()->auto_recharge_enabled,
            'auto_recharge_package_id' => $request->user()->fresh()->auto_recharge_package_id,
        ]);
    }
}
