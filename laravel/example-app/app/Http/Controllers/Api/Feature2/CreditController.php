<?php

namespace App\Http\Controllers\Api\Feature2;

use App\Http\Controllers\Controller;
use App\Services\Feature2\BillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CreditController extends Controller
{
    public function deduct(Request $request): JsonResponse
    {
        $data = $request->validate([
            'credits' => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $user = $request->user();

        if ($user->credit_balance < $data['credits'] && $user->auto_recharge_enabled) {
            BillingService::make()->processAutoRecharge($user);
            $user->refresh();
        }

        if ($user->credit_balance < $data['credits']) {
            return response()->json([
                'message' => 'Insufficient credits. You need to buy a package or enable auto recharge.',
                'credit_balance' => $user->credit_balance,
            ], 422);
        }

        DB::transaction(function () use ($user, $data) {
            $freshUser = $user->newQuery()->lockForUpdate()->findOrFail($user->id);

            $freshUser->decrement('credit_balance', $data['credits']);

            $freshUser->transactions()->create([
                'type' => 'deduction',
                'description' => $data['description'] ?? 'Credit deduction',
                'credits' => -1 * $data['credits'],
                'amount' => 0,
                'status' => 'completed',
                'metadata' => [
                    'source' => 'credits_deduct_endpoint',
                ],
            ]);
        });

        $user->refresh();

        return response()->json([
            'message' => 'Credits deducted successfully.',
            'credit_balance' => $user->credit_balance,
        ]);
    }
}
