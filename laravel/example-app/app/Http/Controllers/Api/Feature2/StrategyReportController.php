<?php

namespace App\Http\Controllers\Api\Feature2;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StrategyReportController extends Controller
{
    private const STRATEGY_CREDIT_COST = 5;

    public function index(Request $request): JsonResponse
    {
        $reports = $request->user()->reports()->latest()->get();

        return response()->json($reports->map(fn (Report $report) => $this->transformReport($report))->values());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'industry' => ['required', 'string', 'max:255'],
            'target_market' => ['nullable', 'string', 'max:255'],
            'objective' => ['nullable', 'string', 'max:255'],
            'timeline' => ['nullable', 'string', 'max:255'],
            'budget_range' => ['nullable', 'string', 'max:255'],
            'challenges' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        if ($user->credit_balance < self::STRATEGY_CREDIT_COST) {
            return response()->json([
                'message' => 'Insufficient credits.',
                'required_credits' => self::STRATEGY_CREDIT_COST,
                'credit_balance' => $user->credit_balance,
            ], 422);
        }

        $report = DB::transaction(function () use ($user, $data) {
            $freshUser = $user->newQuery()->lockForUpdate()->findOrFail($user->id);

            if ($freshUser->credit_balance < self::STRATEGY_CREDIT_COST) {
                abort(422, 'Insufficient credits.');
            }

            $freshUser->decrement('credit_balance', self::STRATEGY_CREDIT_COST);
            $freshUser->transactions()->create([
                'type' => 'deduction',
                'description' => 'AI strategy generation',
                'credits' => -1 * self::STRATEGY_CREDIT_COST,
                'amount' => 0,
                'status' => 'completed',
                'metadata' => ['source' => 'strategy_reports_store'],
            ]);

            return $freshUser->reports()->create([
                'title' => $data['company_name'].' Strategy',
                'sections' => [
                    'company_name' => $data['company_name'],
                    'industry' => $data['industry'],
                    'target_market' => $data['target_market'] ?? null,
                    'objective' => $data['objective'] ?? null,
                    'timeline' => $data['timeline'] ?? null,
                    'budget_range' => $data['budget_range'] ?? null,
                    'challenges' => $data['challenges'] ?? null,
                    'summary' => 'Strategy draft generated for '.$data['company_name'].'.',
                    'priorities' => ['Define quarterly goals', 'Launch pilot campaign', 'Track weekly KPI performance'],
                    'risks' => ['Budget pressure', 'Channel volatility'],
                    'kpis' => ['MRR', 'CAC', 'Conversion rate'],
                ],
            ]);
        });

        return response()->json($this->transformReport($report), 201);
    }

    public function show(Request $request, Report $strategyReport): JsonResponse
    {
        abort_unless($strategyReport->user_id === $request->user()->id, 404);
        return response()->json($this->transformReport($strategyReport));
    }

    private function transformReport(Report $report): array
    {
        $sections = is_array($report->sections) ? $report->sections : [];

        return [
            'id' => $report->id,
            'company_name' => $sections['company_name'] ?? $report->title,
            'industry' => $sections['industry'] ?? '',
            'target_market' => $sections['target_market'] ?? '',
            'objective' => $sections['objective'] ?? '',
            'timeline' => $sections['timeline'] ?? '',
            'budget_range' => $sections['budget_range'] ?? '',
            'challenges' => $sections['challenges'] ?? '',
            'summary' => $sections['summary'] ?? '',
            'priorities' => $sections['priorities'] ?? [],
            'risks' => $sections['risks'] ?? [],
            'kpis' => $sections['kpis'] ?? [],
            'created_at' => $report->created_at,
        ];
    }
}
