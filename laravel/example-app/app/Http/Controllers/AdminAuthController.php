<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $throttleKey = sprintf('admin-login:%s|%s', strtolower($credentials['email']), $request->ip());
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            throw ValidationException::withMessages([
                'email' => ['Too many login attempts. Please try again in 1 minute.'],
            ]);
        }

        $adminEmail = env('ADMIN_EMAIL', 'admin@strategai.com');
        $adminPasswordHash = (string) env('ADMIN_PASSWORD_HASH', '');
        $adminPasswordPlain = (string) env('ADMIN_PASSWORD', '');
        $passwordMatches = $adminPasswordHash !== ''
            ? Hash::check($credentials['password'], $adminPasswordHash)
            : ($adminPasswordPlain !== '' && hash_equals($adminPasswordPlain, $credentials['password']));

        if (
            ! hash_equals(strtolower($adminEmail), strtolower($credentials['email'])) ||
            ! $passwordMatches
        ) {
            RateLimiter::hit($throttleKey, 60);
            throw ValidationException::withMessages([
                'email' => ['The provided admin credentials are invalid.'],
            ]);
        }
        RateLimiter::clear($throttleKey);

        $user = User::firstOrCreate(
            ['email' => $adminEmail],
            [
                'name' => 'Admin',
                'password' => Hash::make(Str::random(32)),
                'credit_balance' => 0,
            ],
        );

        return response()->json([
            'message' => 'Admin login successful.',
            'token' => env('ADMIN_API_TOKEN', 'local-admin-token'),
            'user' => [
                'id' => $user->id,
                'name' => $user->name ?: 'Admin',
                'email' => $adminEmail,
                'role' => 'admin',
                'last_login_at' => now()->toISOString(),
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->attributes->get('auth_user');

        return response()->json([
            'user' => [
                'id' => $user?->id,
                'name' => $user?->name ?: 'Admin',
                'email' => env('ADMIN_EMAIL', 'admin@strategai.com'),
                'role' => 'admin',
            ],
        ]);
    }

    public function logout(): JsonResponse
    {
        return response()->json([
            'message' => 'Admin logout successful.',
        ]);
    }
}
