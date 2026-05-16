<?php

use App\Http\Controllers\Api\Feature1\AuthController;
use App\Http\Controllers\Api\Feature2\BillingController;
use App\Http\Controllers\Api\Feature2\CreditController;
use App\Http\Controllers\Api\Feature2\CreditPackageController;
use App\Http\Controllers\Api\Feature2\StrategyReportController;
use App\Http\Controllers\Api\Feature2\StripeWebhookController;
use App\Http\Controllers\Api\Feature2\TransactionController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ReportController as ApiReportController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminNotificationController;
use App\Http\Controllers\AdminProjectController;
use App\Http\Controllers\AdminReviewController;
use App\Http\Controllers\AdminReportsOverviewController;
use App\Http\Controllers\AdminSettingsController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\ProjectController as Feature3ProjectController;
use App\Http\Controllers\ReportController as Feature3ReportController;
use App\Http\Controllers\UserReviewController;
use App\Models\Notification;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);


Route::get('/notifications', function () {
    return Notification::latest()->get();
});

Route::post('/notifications', function (Request $request) {
    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'message' => 'required|string',
        'is_read' => 'sometimes|boolean',
    ]);

    $notification = Notification::create($validated);

    return response()->json([
        'message' => 'Notification created successfully',
        'notification' => $notification,
    ], 201);
});

Route::put('/notifications/read-all', function () {
    Notification::query()->update(['is_read' => true]);

    return response()->json([
        'message' => 'All notifications marked as read',
    ]);
});

Route::prefix('admin')->group(function (): void {
    Route::post('/login', [AdminAuthController::class, 'login']);

    Route::middleware('admin')->group(function (): void {
        Route::get('/me', [AdminAuthController::class, 'me']);
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::post('/users', [AdminUserController::class, 'store']);
        Route::patch('/users/{user}', [AdminUserController::class, 'update']);
        Route::post('/projects', [AdminProjectController::class, 'store']);
        Route::get('/reports-overview', [AdminReportsOverviewController::class, 'index']);
        Route::get('/reports-overview/export', [AdminReportsOverviewController::class, 'export']);
        Route::get('/reports-overview/analytics', [AdminReportsOverviewController::class, 'analytics']);
        Route::get('/reports-overview/filter-options', [AdminReportsOverviewController::class, 'filterOptions']);
        Route::get('/notifications', [AdminNotificationController::class, 'index']);
        Route::post('/notifications', [AdminNotificationController::class, 'store']);
        Route::put('/notifications/read-all', [AdminNotificationController::class, 'markAllRead']);
        Route::patch('/notifications/{notification}', [AdminNotificationController::class, 'update']);
        Route::delete('/notifications/{notification}', [AdminNotificationController::class, 'destroy']);
        Route::get('/reviews', [AdminReviewController::class, 'index']);
        Route::post('/reviews', [AdminReviewController::class, 'store']);
        Route::patch('/reviews/{review}', [AdminReviewController::class, 'update']);
        Route::delete('/reviews/{review}', [AdminReviewController::class, 'destroy']);
        Route::get('/settings', [AdminSettingsController::class, 'show']);
        Route::put('/settings', [AdminSettingsController::class, 'update']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/user/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('projects', Feature3ProjectController::class);
    Route::apiResource('reports', ApiReportController::class)->except(['index', 'show']);
    Route::post('reports/generate', [Feature3ReportController::class, 'generate']);
    Route::get('reports', [Feature3ReportController::class, 'index']);
    Route::get('reports/{id}', [Feature3ReportController::class, 'show']);
    Route::apiResource('credit-packages', CreditPackageController::class);
    Route::apiResource('transactions', TransactionController::class);

    Route::post('/credits/deduct', [CreditController::class, 'deduct']);
    Route::post('/billing/setup-intent', [BillingController::class, 'createSetupIntent']);
    Route::post('/billing/payment-method', [BillingController::class, 'savePaymentMethod']);
    Route::post('/billing/checkout-session', [BillingController::class, 'createCheckoutSession']);
    Route::post('/billing/checkout-session/confirm', [BillingController::class, 'confirmCheckoutSession']);
    Route::post('/billing/auto-recharge', [BillingController::class, 'updateAutoRechargeSettings']);

    Route::get('/credit-transactions', [TransactionController::class, 'index']);
    Route::get('/credits-overview', function (\Illuminate\Http\Request $request) {
        return response()->json([
            'user' => $request->user()->fresh(),
            'transactions' => $request->user()->transactions()->latest()->get(),
        ]);
    });
    Route::post('/credits/auto-recharge', [BillingController::class, 'updateAutoRechargeSettings']);
    Route::post('/stripe/setup-intent', [BillingController::class, 'createSetupIntent']);
    Route::post('/stripe/payment-method', [BillingController::class, 'savePaymentMethod']);
    Route::post('/stripe/checkout-session', [BillingController::class, 'createCheckoutSession']);
    Route::post('/stripe/checkout-session/confirm', [BillingController::class, 'confirmCheckoutSession']);

    Route::get('/strategy-reports', [StrategyReportController::class, 'index']);
    Route::post('/strategy-reports', [StrategyReportController::class, 'store']);
    Route::get('/strategy-reports/{strategyReport}', [StrategyReportController::class, 'show']);
    Route::get('/reviews/my', [UserReviewController::class, 'index']);
    Route::post('/reviews', [UserReviewController::class, 'store']);

    Route::get('/comparison/{projectId}', function (Request $request, $projectId) {
        return Report::with('project')
            ->where('project_id', $projectId)
            ->where('user_id', $request->user()->id)
            ->orderBy('id', 'asc')
            ->get();
    });
});
