<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/reset-password/{token}', function (string $token) {
    $email = request('email');
    $query = http_build_query(array_filter([
        'token' => $token,
        'email' => $email,
    ]));

    return redirect("http://127.0.0.1:5179/reset-password?{$query}");
})->name('password.reset');
