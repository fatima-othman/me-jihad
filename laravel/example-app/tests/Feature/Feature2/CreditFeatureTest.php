<?php

namespace Tests\Feature\Feature2;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CreditFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_credits_deduct_endpoint_reduces_balance_and_logs_transaction(): void
    {
        $user = User::factory()->create(['credit_balance' => 30]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/credits/deduct', [
            'credits' => 10,
            'description' => 'Generate report',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('credit_balance', 20);

        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'type' => 'deduction',
            'credits' => -10,
            'description' => 'Generate report',
            'status' => 'completed',
        ]);
    }

    public function test_credits_deduct_endpoint_blocks_when_balance_is_insufficient(): void
    {
        $user = User::factory()->create(['credit_balance' => 5]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/credits/deduct', [
            'credits' => 10,
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('message', 'Insufficient credits. You need to buy a package or enable auto recharge.')
            ->assertJsonPath('credit_balance', 5);
    }
}
