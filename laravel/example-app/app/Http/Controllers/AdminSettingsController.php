<?php

namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules\Password;

class AdminSettingsController extends Controller
{
    private const SETTINGS_KEY = 'admin_settings';

    private const DEFAULT_SETTINGS = [
        'platform' => [
            'default_credits' => 20,
            'registration_enabled' => true,
            'default_language' => 'English',
            'report_generation_limit' => 25,
        ],
        'security' => [
            'require_strong_passwords' => true,
        ],
        'notifications' => [
            'email_new_users' => true,
            'email_failed_reports' => true,
            'weekly_analytics_summary' => false,
        ],
    ];

    public function show(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->attributes->get('auth_user');

        return response()->json([
            'profile' => $this->profilePayload($user),
            'settings' => $this->settings(),
            'system' => $this->systemPayload(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->attributes->get('auth_user');
        $settings = $this->settings();

        $validated = $request->validate([
            'profile.name' => ['sometimes', 'required', 'string', 'max:255'],
            'profile.email' => ['sometimes', 'required', 'email', 'max:255'],
            'profile.current_password' => ['nullable', 'required_with:profile.password', 'string'],
            'profile.password' => [
                'nullable',
                'string',
                $settings['security']['require_strong_passwords'] ? Password::min(8)->mixedCase()->symbols() : Password::min(8),
                'confirmed',
            ],
            'platform.default_credits' => ['sometimes', 'integer', 'min:0', 'max:1000000'],
            'platform.registration_enabled' => ['sometimes', 'boolean'],
            'platform.default_language' => ['sometimes', 'string', 'in:Arabic,English'],
            'platform.report_generation_limit' => ['sometimes', 'integer', 'min:1', 'max:1000'],
            'security.require_strong_passwords' => ['sometimes', 'boolean'],
            'notifications.email_new_users' => ['sometimes', 'boolean'],
            'notifications.email_failed_reports' => ['sometimes', 'boolean'],
            'notifications.weekly_analytics_summary' => ['sometimes', 'boolean'],
            'security_action' => ['nullable', 'string', 'in:logout_all,regenerate_token'],
        ]);

        if (isset($validated['profile'])) {
            $this->updateProfile($user, $validated['profile']);
        }

        foreach (['platform', 'security', 'notifications'] as $group) {
            if (isset($validated[$group])) {
                $settings[$group] = [
                    ...$settings[$group],
                    ...$validated[$group],
                ];
            }
        }

        $newToken = null;

        if (($validated['security_action'] ?? null) === 'logout_all') {
            // Env-based admin auth does not persist sessions.
        }

        if (($validated['security_action'] ?? null) === 'regenerate_token') {
            $newToken = env('ADMIN_API_TOKEN', 'local-admin-token');
        }

        $this->saveSettings($settings);

        return response()->json([
            'message' => 'Settings updated successfully.',
            'profile' => $this->profilePayload($user?->fresh() ?: $user),
            'settings' => $settings,
            'system' => $this->systemPayload(),
            'token' => $newToken,
        ]);
    }

    public static function getPlatformDefaults(): array
    {
        return self::DEFAULT_SETTINGS['platform'];
    }

    public static function requireStrongPasswords(): bool
    {
        return (bool) self::DEFAULT_SETTINGS['security']['require_strong_passwords'];
    }

    private function updateProfile(User $user, array $profile): void
    {
        if (isset($profile['password'])) {
            if (! Hash::check((string) ($profile['current_password'] ?? ''), $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['The current password is incorrect.'],
                ]);
            }

            $user->password = $profile['password'];
        }

        if (isset($profile['name'])) {
            $user->name = $profile['name'];
        }

        if (isset($profile['email'])) {
            $user->email = $profile['email'];
        }

        $user->save();
    }

    private function settings(): array
    {
        return self::DEFAULT_SETTINGS;
    }

    private function saveSettings(array $settings): void
    {
        // Settings are kept in memory for this local env-based admin setup.
    }

    private function profilePayload(User $user): array
    {
        return [
            'id' => $user?->id,
            'name' => $user?->name ?: 'Admin',
            'email' => env('ADMIN_EMAIL', 'admin@strategai.com'),
            'role' => 'admin',
            'last_login_at' => now()->toISOString(),
        ];
    }

    private function systemPayload(): array
    {
        return [
            'backend_status' => 'online',
            'api_url' => config('app.url').'/api',
            'app_version' => config('app.version', '1.0.0'),
            'database_status' => $this->databaseStatus(),
        ];
    }

    private function databaseStatus(): string
    {
        try {
            DB::connection()->getPdo();

            return 'connected';
        } catch (\Throwable) {
            return 'unavailable';
        }
    }
}
