<?php

use App\Models\CreditPackage;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function () {
            CreditPackage::query()->update(['is_active' => false]);

            $packages = [
                ['name' => 'Starter', 'credits' => 70, 'price' => 50.00],
                ['name' => 'Growth', 'credits' => 200, 'price' => 120.00],
                ['name' => 'Business', 'credits' => 500, 'price' => 260.00],
                ['name' => 'Enterprise', 'credits' => 1200, 'price' => 550.00],
            ];

            foreach ($packages as $package) {
                CreditPackage::query()->updateOrCreate(
                    ['name' => $package['name']],
                    [
                        'credits' => $package['credits'],
                        'price' => $package['price'],
                        'is_active' => true,
                    ]
                );
            }
        });
    }

    public function down(): void
    {
        CreditPackage::query()
            ->whereIn('name', ['Starter', 'Growth', 'Business', 'Enterprise'])
            ->delete();
    }
};
