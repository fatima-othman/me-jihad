<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('stripe_customer_id')->nullable()->after('credit_balance');
            $table->string('stripe_payment_method_id')->nullable()->after('stripe_customer_id');
            $table->boolean('auto_recharge_enabled')->default(false)->after('stripe_payment_method_id');
            $table->foreignId('auto_recharge_package_id')->nullable()->after('auto_recharge_enabled')->constrained('credit_packages')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('auto_recharge_package_id');
            $table->dropColumn(['stripe_customer_id', 'stripe_payment_method_id', 'auto_recharge_enabled']);
        });
    }
};
