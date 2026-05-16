<?php

namespace Tests\Feature\Feature2;

use App\Models\CreditPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FinancialPlanFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_credit_packages_endpoint_returns_active_financial_plan_packages(): void
    {
        CreditPackage::query()->create([
            'name' => 'Legacy',
            'credits' => 999,
            'price' => 1.00,
            'is_active' => false,
        ]);

        CreditPackage::query()->create(['name' => 'Starter', 'credits' => 70, 'price' => 50.00, 'is_active' => true]);
        CreditPackage::query()->create(['name' => 'Growth', 'credits' => 200, 'price' => 120.00, 'is_active' => true]);
        CreditPackage::query()->create(['name' => 'Business', 'credits' => 500, 'price' => 260.00, 'is_active' => true]);
        CreditPackage::query()->create(['name' => 'Enterprise', 'credits' => 1200, 'price' => 550.00, 'is_active' => true]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/credit-packages');

        $response->assertOk();
        $response->assertJsonFragment(['name' => 'Starter', 'credits' => 70]);
        $response->assertJsonFragment(['name' => 'Growth', 'credits' => 200]);
        $response->assertJsonFragment(['name' => 'Business', 'credits' => 500]);
        $response->assertJsonFragment(['name' => 'Enterprise', 'credits' => 1200]);
        $response->assertJsonMissing(['name' => 'Legacy']);
    }

    public function test_report_creation_deducts_10_credits_and_logs_transaction(): void
    {
        $user = User::factory()->create(['credit_balance' => 25]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/reports', [
            'title' => 'Q2 Strategy Report',
            'sections' => ['summary' => 'test'],
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('reports', [
            'user_id' => $user->id,
            'title' => 'Q2 Strategy Report',
        ]);

        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'type' => 'deduction',
            'description' => 'Report generation',
            'credits' => -10,
            'status' => 'completed',
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'credit_balance' => 15,
        ]);
    }

    public function test_report_creation_fails_with_clear_message_when_credits_are_insufficient(): void
    {
        $user = User::factory()->create(['credit_balance' => 7]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/reports', [
            'title' => 'Low Credits Report',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('message', 'Insufficient credits. Each report requires 10 credits.')
            ->assertJsonPath('required_credits', 10)
            ->assertJsonPath('credit_balance', 7);
    }
}
