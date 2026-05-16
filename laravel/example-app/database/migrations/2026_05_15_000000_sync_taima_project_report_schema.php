<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (! Schema::hasColumn('projects', 'business_type')) {
                $table->string('business_type')->nullable()->after('name');
            }
            if (! Schema::hasColumn('projects', 'stage')) {
                $table->string('stage')->nullable()->after('description');
            }
            if (! Schema::hasColumn('projects', 'employees')) {
                $table->string('employees')->nullable()->after('stage');
            }
            if (! Schema::hasColumn('projects', 'budget')) {
                $table->string('budget')->nullable()->after('employees');
            }
            if (! Schema::hasColumn('projects', 'market')) {
                $table->text('market')->nullable()->after('budget');
            }
            if (! Schema::hasColumn('projects', 'competitors')) {
                $table->text('competitors')->nullable()->after('market');
            }
            if (! Schema::hasColumn('projects', 'language')) {
                $table->string('language')->default('English')->after('competitors');
            }
        });

        Schema::table('reports', function (Blueprint $table) {
            if (! Schema::hasColumn('reports', 'credits_used')) {
                $table->integer('credits_used')->default(0)->after('title');
            }
            if (! Schema::hasColumn('reports', 'selected_sections')) {
                $table->json('selected_sections')->nullable()->after('sections');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            if (Schema::hasColumn('reports', 'selected_sections')) {
                $table->dropColumn('selected_sections');
            }
            if (Schema::hasColumn('reports', 'credits_used')) {
                $table->dropColumn('credits_used');
            }
        });

        Schema::table('projects', function (Blueprint $table) {
            foreach (['language', 'competitors', 'market', 'budget', 'employees', 'stage', 'business_type'] as $column) {
                if (Schema::hasColumn('projects', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
