<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'credit_balance',
        'stripe_customer_id',
        'stripe_payment_method_id',
        'auto_recharge_enabled',
        'auto_recharge_package_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'auto_recharge_enabled' => 'boolean',
        ];
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function autoRechargePackage()
    {
        return $this->belongsTo(CreditPackage::class, 'auto_recharge_package_id');
    }
}
