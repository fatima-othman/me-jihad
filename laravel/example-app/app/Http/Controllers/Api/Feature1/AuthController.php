<?php

namespace App\Http\Controllers\Api\Feature1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Feature2\BillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', Password::min(8)->mixedCase()->symbols(), 'confirmed'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'credit_balance' => 20,
        ]);

        $user->transactions()->create([
            'type' => 'signup_bonus',
            'description' => 'Welcome credits',
            'credits' => 20,
            'amount' => 0,
            'status' => 'completed',
            'metadata' => [
                'source' => 'register',
            ],
        ]);

        if (filled(config('services.stripe.secret'))) {
            try {
                BillingService::make()->ensureStripeCustomer($user);
                $user->refresh();
            } catch (\Throwable $e) {
                Log::warning('Stripe customer creation failed on registration', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registered successfully.',
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
            'expires_in_minutes' => 10080,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $throttleKey = sprintf('user-login:%s|%s', strtolower($data['email']), $request->ip());
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            throw ValidationException::withMessages([
                'email' => ['Too many login attempts. Please try again in 1 minute.'],
            ]);
        }

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            RateLimiter::hit($throttleKey, 60);
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }
        RateLimiter::clear($throttleKey);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully.',
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
            'expires_in_minutes' => 10080,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'id' => $request->user()->id,
            'name' => $request->user()->name,
            'email' => $request->user()->email,
            'credit_balance' => $request->user()->credit_balance,
            'stripe_customer_id' => $request->user()->stripe_customer_id,
            'stripe_payment_method_id' => $request->user()->stripe_payment_method_id,
            'auto_recharge_enabled' => (bool) $request->user()->auto_recharge_enabled,
            'auto_recharge_package_id' => $request->user()->auto_recharge_package_id,
            'created_at' => $request->user()->created_at,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'current_password' => ['nullable', 'required_with:password', 'string'],
            'password' => ['nullable', 'string', Password::min(8)->mixedCase()->symbols(), 'confirmed'],
        ]);

        if (isset($validated['password'])) {
            if (! Hash::check((string) ($validated['current_password'] ?? ''), $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['The current password is incorrect.'],
                ]);
            }

            $user->password = Hash::make($validated['password']);
        }

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }

        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'credit_balance' => $user->credit_balance,
                'stripe_customer_id' => $user->stripe_customer_id,
                'stripe_payment_method_id' => $user->stripe_payment_method_id,
                'auto_recharge_enabled' => (bool) $user->auto_recharge_enabled,
                'auto_recharge_package_id' => $user->auto_recharge_package_id,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }
}
