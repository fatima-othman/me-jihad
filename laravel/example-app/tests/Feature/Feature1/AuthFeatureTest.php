<?php

namespace Tests\Feature\Feature1;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receive_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Fatima',
            'email' => 'fatima@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email', 'credit_balance'],
                'token',
                'token_type',
                'expires_in_minutes',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'fatima@example.com',
            'credit_balance' => 20,
        ]);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'exists@example.com']);

        $response = $this->postJson('/api/register', [
            'name' => 'Fatima',
            'email' => 'exists@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_user_can_login_and_get_profile(): void
    {
        $user = User::factory()->create([
            'email' => 'login@example.com',
            'password' => bcrypt('password123'),
            'credit_balance' => 35,
        ]);

        $login = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'password123',
        ]);

        $token = $login->json('token');

        $login
            ->assertOk()
            ->assertJsonPath('token_type', 'Bearer');

        $profile = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/user/me');

        $profile
            ->assertOk()
            ->assertJsonPath('id', $user->id)
            ->assertJsonPath('email', 'login@example.com')
            ->assertJsonPath('credit_balance', 35);
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'wrong@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'wrong@example.com',
            'password' => 'invalid-password',
        ]);

        $response->assertUnprocessable();
    }
}
