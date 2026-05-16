<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Report;
use App\Services\Feature2\BillingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    private const REPORT_CREDIT_COST = 10;

    public function index(Request $request)
    {
        $reports = $request->user()->reports()->with('project')->latest()->get();

        return response()->json($reports);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'title' => ['required', 'string', 'max:255'],
            'sections' => ['nullable', 'array'],
        ]);

        $user = $request->user();

        if ($user->credit_balance < self::REPORT_CREDIT_COST && $user->auto_recharge_enabled) {
            BillingService::make()->processAutoRecharge($user);
            $user->refresh();
        }

        if ($user->credit_balance < self::REPORT_CREDIT_COST) {
            return response()->json([
                'message' => 'Insufficient credits. Each report requires 10 credits.',
                'required_credits' => self::REPORT_CREDIT_COST,
                'credit_balance' => $user->credit_balance,
            ], 422);
        }

        if (! empty($data['project_id'])) {
            $projectBelongsToUser = Project::where('id', $data['project_id'])
                ->where('user_id', $request->user()->id)
                ->exists();

            abort_unless($projectBelongsToUser, 422, 'Invalid project_id for this user.');
        }

        $report = DB::transaction(function () use ($user, $data) {
            $freshUser = $user->newQuery()->lockForUpdate()->findOrFail($user->id);

            if ($freshUser->credit_balance < self::REPORT_CREDIT_COST) {
                abort(422, 'Insufficient credits. Each report requires 10 credits.');
            }

            $freshUser->decrement('credit_balance', self::REPORT_CREDIT_COST);

            $freshUser->transactions()->create([
                'type' => 'deduction',
                'description' => 'Report generation',
                'credits' => -1 * self::REPORT_CREDIT_COST,
                'amount' => 0,
                'status' => 'completed',
                'metadata' => [
                    'source' => 'report_store',
                ],
            ]);

            return $freshUser->reports()->create($data);
        });

        return response()->json($report->load('project'), 201);
    }

    public function show(Request $request, Report $report)
    {
        abort_unless($report->user_id === $request->user()->id, 404);

        return response()->json($report->load('project'));
    }

    public function update(Request $request, Report $report)
    {
        abort_unless($report->user_id === $request->user()->id, 404);

        $data = $request->validate([
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'sections' => ['nullable', 'array'],
        ]);

        if (array_key_exists('project_id', $data) && ! empty($data['project_id'])) {
            $projectBelongsToUser = Project::where('id', $data['project_id'])
                ->where('user_id', $request->user()->id)
                ->exists();

            abort_unless($projectBelongsToUser, 422, 'Invalid project_id for this user.');
        }

        $report->update($data);

        return response()->json($report->load('project'));
    }

    public function destroy(Request $request, Report $report)
    {
        abort_unless($report->user_id === $request->user()->id, 404);

        $report->delete();

        return response()->json(['message' => 'Report deleted successfully.']);
    }
}
