<?php

namespace App\Http\Controllers\Api\Feature2;

use App\Http\Controllers\Controller;
use App\Models\CreditPackage;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $transactions = $request->user()->transactions()->with('creditPackage')->latest()->get();

        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'credit_package_id' => ['nullable', 'integer', 'exists:credit_packages,id'],
            'type' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:255'],
            'credits' => ['nullable', 'integer'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'string', 'max:50'],
            'metadata' => ['nullable', 'array'],
        ]);

        if (! empty($data['credit_package_id'])) {
            $package = CreditPackage::findOrFail($data['credit_package_id']);
            $data['credits'] ??= $package->credits;
            $data['amount'] ??= $package->price;
            $data['type'] ??= 'purchase';
        }

        $data['status'] ??= 'completed';
        $data['credits'] ??= 0;
        $data['amount'] ??= 0;

        $transaction = $request->user()->transactions()->create($data);

        return response()->json($transaction->load('creditPackage'), 201);
    }

    public function show(Request $request, Transaction $transaction)
    {
        abort_unless($transaction->user_id === $request->user()->id, 404);

        return response()->json($transaction->load('creditPackage'));
    }

    public function update(Request $request, Transaction $transaction)
    {
        abort_unless($transaction->user_id === $request->user()->id, 404);

        $data = $request->validate([
            'credit_package_id' => ['nullable', 'integer', 'exists:credit_packages,id'],
            'type' => ['sometimes', 'required', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:255'],
            'credits' => ['sometimes', 'required', 'integer'],
            'amount' => ['sometimes', 'required', 'numeric', 'min:0'],
            'status' => ['sometimes', 'required', 'string', 'max:50'],
            'metadata' => ['nullable', 'array'],
        ]);

        $transaction->update($data);

        return response()->json($transaction->load('creditPackage'));
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        abort_unless($transaction->user_id === $request->user()->id, 404);

        $transaction->delete();

        return response()->json(['message' => 'Transaction deleted successfully.']);
    }
}
