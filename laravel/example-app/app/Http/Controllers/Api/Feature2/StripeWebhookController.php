<?php

namespace App\Http\Controllers\Api\Feature2;

use App\Http\Controllers\Controller;
use App\Models\CreditPackage;
use App\Models\Transaction;
use App\Models\User;
use App\Services\Feature2\BillingService;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $signature = (string) $request->header('Stripe-Signature');
        $secret = (string) config('services.stripe.webhook_secret');

        try {
            $event = $secret !== ''
                ? Webhook::constructEvent($payload, $signature, $secret)
                : json_decode($payload, true, 512, JSON_THROW_ON_ERROR);
        } catch (SignatureVerificationException $e) {
            if (app()->environment('local')) {
                Log::warning('Stripe webhook signature check failed in local mode. Processing payload without verification.', [
                    'error' => $e->getMessage(),
                ]);

                try {
                    $event = json_decode($payload, true, 512, JSON_THROW_ON_ERROR);
                } catch (\Throwable $decodeException) {
                    return response()->json(['message' => 'Invalid payload.'], 400);
                }

                $type = is_array($event) ? Arr::get($event, 'type') : $event->type;
                $dataObject = is_array($event) ? Arr::get($event, 'data.object') : $event->data->object;

                if ($type === 'checkout.session.completed') {
                    $this->handleCheckoutCompleted($dataObject);
                }

                return response()->json(['received' => true, 'mode' => 'local-bypass']);
            }

            return response()->json(['message' => 'Invalid webhook signature.'], 400);
        } catch (\Throwable $e) {
            Log::warning('Invalid Stripe webhook payload', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Invalid payload.'], 400);
        }

        $type = is_array($event) ? Arr::get($event, 'type') : $event->type;
        $dataObject = is_array($event) ? Arr::get($event, 'data.object') : $event->data->object;

        if ($type === 'checkout.session.completed') {
            $this->handleCheckoutCompleted($dataObject);
        }

        return response()->json(['received' => true]);
    }

    private function handleCheckoutCompleted(object|array $session): void
    {
        $sessionId = is_array($session) ? Arr::get($session, 'id') : $session->id;
        if (! $sessionId) {
            return;
        }

        $existing = Transaction::where('stripe_checkout_session_id', $sessionId)->first();
        if ($existing && $existing->status === 'completed') {
            return;
        }

        $metadata = is_array($session)
            ? (array) Arr::get($session, 'metadata', [])
            : (array) ($session->metadata ?? []);

        $userId = (int) ($metadata['user_id'] ?? 0);
        $packageId = (int) ($metadata['credit_package_id'] ?? 0);
        $credits = (int) ($metadata['credits'] ?? 0);

        if ($userId <= 0 || $packageId <= 0 || $credits <= 0) {
            return;
        }

        $user = User::find($userId);
        $package = CreditPackage::find($packageId);

        if (! $user || ! $package) {
            return;
        }

        if ($existing) {
            $existing->update([
                'status' => 'completed',
                'description' => sprintf('Purchased package: %s', $package->name),
                'metadata' => array_merge((array) $existing->metadata, ['source' => 'stripe_webhook']),
            ]);

            $user->increment('credit_balance', $credits);
            return;
        }

        BillingService::make()->grantCredits($user, $credits, [
            'credit_package_id' => $package->id,
            'type' => 'credit_purchase',
            'description' => sprintf('Purchased package: %s', $package->name),
            'amount' => $package->price,
            'status' => 'completed',
            'stripe_checkout_session_id' => $sessionId,
            'metadata' => [
                'source' => 'stripe_webhook',
            ],
        ]);
    }
}
