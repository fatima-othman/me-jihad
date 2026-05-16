<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        $expectedToken = env('ADMIN_API_TOKEN', 'local-admin-token');

        if (! $token || ! hash_equals($expectedToken, $token)) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $user = User::query()
            ->where('email', env('ADMIN_EMAIL', 'admin@strategai.com'))
            ->first();

        $request->attributes->set('auth_user', $user);
        if ($user) {
            $request->setUserResolver(fn (): User => $user);
        }

        return $next($request);
    }
}
