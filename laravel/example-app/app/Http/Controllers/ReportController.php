<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Report;
use App\Services\Feature2\BillingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ReportController extends Controller
{
    private const SECTION_CREDIT_COSTS = [
        'swot' => 5,
        'pricing' => 5,
        'risk' => 5,
        'kpi' => 10,
        'marketing' => 20,
        'growth' => 20,
    ];

    private const BUNDLE_CREDIT_COST = 50;

    public function index(Request $request)
    {
        return Report::where('user_id', $request->user()->id)
            ->with('project')
            ->latest()
            ->get()
            ->map(function ($report) {
                $selectedSections = $report->selected_sections ?: array_keys($report->sections ?: []);
                $projectName = optional($report->project)->name ?: 'Project';
                $score = $this->calculateReportScore($report);

                return [
                    'id' => $report->id,
                    'name' => $report->title ?: "{$projectName} Strategy Report",
                    'project_id' => $report->project_id,
                    'projectId' => $report->project_id,
                    'project' => $report->project,
                    'selected_sections' => $selectedSections,
                    'section_content' => $report->sections ?: [],
                    'type' => $selectedSections[0] ?? 'Strategy',
                    'date' => optional($report->created_at)->toDateString(),
                    'sections' => count($selectedSections),
                    'score' => $score,
                    'swot' => [
                        'strengths' => data_get($report->sections, 'swot', 'Strong business direction'),
                        'weaknesses' => 'Needs more detailed validation',
                        'opportunities' => 'Room for growth in the target market',
                        'threats' => 'Competitive pressure',
                    ],
                    'kpis' => [
                        'revenue' => 82,
                        'marketing' => 88,
                        'retention' => 79,
                    ],
                    'recommendations' => [
                        'Review market fit',
                        'Improve acquisition channels',
                        'Track weekly KPIs',
                    ],
                ];
            });
    }

    public function generate(Request $request)
    {
        $data = $request->validate([
            'project_id' => 'required|integer',
            'selected_sections' => 'required|array|min:1',
            'selected_sections.*' => 'string|in:bundle,swot,pricing,risk,kpi,marketing,growth',
        ]);

        $user = $request->user();

        $project = Project::where('id', $data['project_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        $isBundle = in_array('bundle', $data['selected_sections'], true);
        $creditsUsed = $isBundle
            ? self::BUNDLE_CREDIT_COST
            : collect($data['selected_sections'])->sum(fn ($section) => self::SECTION_CREDIT_COSTS[$section] ?? 0);

        if ($creditsUsed <= 0) {
            return response()->json([
                'message' => 'Invalid section selection.',
            ], 422);
        }

        if ($user->credit_balance < $creditsUsed && $user->auto_recharge_enabled) {
            BillingService::make()->processAutoRecharge($user);
            $user->refresh();
        }

        if ($user->credit_balance < $creditsUsed) {
            return response()->json([
                'message' => 'Insufficient credits for the selected sections.',
                'required_credits' => $creditsUsed,
                'credit_balance' => $user->credit_balance,
            ], 422);
        }

        $prompt = $this->buildPrompt($project, $data['selected_sections'], $isBundle);

        $response = Http::withoutVerifying()
            ->withHeaders([
                'Authorization' => 'Bearer '.env('GROQ_API_KEY'),
                'Content-Type' => 'application/json',
            ])
            ->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => 'llama-3.3-70b-versatile',
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
                'max_tokens' => 4000,
            ]);

        $sections = $response->successful()
            ? $this->parseSections((string) data_get($response->json(), 'choices.0.message.content', ''))
            : $this->fallbackSections($project, $data['selected_sections'], $isBundle);

        if (empty($sections)) {
            $sections = $this->fallbackSections($project, $data['selected_sections'], $isBundle);
        }

        $report = DB::transaction(function () use ($user, $project, $data, $creditsUsed, $sections) {
            $freshUser = $user->newQuery()->lockForUpdate()->findOrFail($user->id);

            if ($freshUser->credit_balance < $creditsUsed) {
                abort(422, 'Insufficient credits for the selected sections.');
            }

            $freshUser->decrement('credit_balance', $creditsUsed);
            $freshUser->transactions()->create([
                'type' => 'deduction',
                'description' => 'Feature 3 report generation',
                'credits' => -1 * $creditsUsed,
                'amount' => 0,
                'status' => 'completed',
                'metadata' => [
                    'source' => 'feature3_report_generate',
                    'project_id' => $project->id,
                    'selected_sections' => $data['selected_sections'],
                ],
            ]);

            return Report::create([
                'user_id' => $freshUser->id,
                'project_id' => $project->id,
                'credits_used' => $creditsUsed,
                'sections' => $sections,
                'selected_sections' => $data['selected_sections'],
            ]);
        });

        return response()->json([
            'report' => $report,
            'credit_balance' => $user->fresh()->credit_balance,
            'credits_used' => $creditsUsed,
        ], 201);
    }

    private function buildPrompt($project, $selectedSections, $isBundle)
    {
        $isArabic = $project->language === '???????';

        $sections = $isBundle
            ? ['swot', 'pricing', 'risk', 'kpi', 'marketing', 'growth']
            : $selectedSections;

        $sectionTitles = collect($sections)
            ->map(fn ($section) => "[{$section}]")
            ->join(', ');

        if ($isArabic) {
            return "You are a professional business consultant.
IMPORTANT: Write ALL content in Arabic only. Do not use any other language.
IMPORTANT: Use ONLY these exact section markers in English: {$sectionTitles}

Business Info:
- Type: {$project->business_type}
- Stage: {$project->stage}
- Employees: {$project->employees}
- Budget: {$project->budget}
- Market: {$project->market}
- Competitors: {$project->competitors}

Write a detailed strategy report. Start each section with its marker in square brackets.
Example format:
[swot]
(Arabic content here...)

[marketing]
(Arabic content here...)

Only Arabic text in the content. No mixed languages. No intro or conclusion.";
        }

        return "You are a professional business consultant specialized in {$project->business_type} companies.
Business Type: {$project->business_type}
Stage: {$project->stage}
Employees: {$project->employees}
Budget: {$project->budget}
Target Market: {$project->market}
Competitors: {$project->competitors}

Write a comprehensive strategy report. Start each section with its marker in square brackets.
Required sections: {$sectionTitles}
No intro or conclusion. Only the requested sections.";
    }

    private function parseSections($text)
    {
        $sections = [];
        preg_match_all('/\[([^\]]+)\](.*?)(?=\[|$)/s', $text, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $key = strtolower(trim($match[1]));
            $key = str_replace(' ', '_', $key);
            $sections[$key] = trim($match[2]);
        }

        return $sections;
    }

    private function fallbackSections(Project $project, array $selectedSections, bool $isBundle): array
    {
        $sections = $isBundle
            ? ['swot', 'pricing', 'risk', 'kpi', 'marketing', 'growth']
            : $selectedSections;

        $templates = [
            'swot' => "Strengths: {$project->name} has a focused business idea and a clear target direction.\nWeaknesses: The project needs more validation, stronger operations, and consistent tracking.\nOpportunities: There is room to grow through digital channels, partnerships, and customer loyalty.\nThreats: Competition, pricing pressure, and changing customer preferences should be monitored.",
            'pricing' => "Use a launch-friendly pricing strategy for {$project->business_type}. Start with competitive packages, track customer response, and adjust prices based on demand, margin, and competitor movement.",
            'risk' => "Key risks include high competition, limited budget, operational delays, and weak online visibility. Reduce risk through supplier planning, weekly KPI reviews, and clear marketing priorities.",
            'kpi' => 'Recommended KPIs: monthly revenue, customer acquisition cost, repeat purchase rate, conversion rate, average order value, and social engagement growth.',
            'marketing' => "Focus marketing on the target market: {$project->market}. Use social media content, local promotions, customer stories, and simple offers that encourage first purchases and repeat visits.",
            'growth' => 'Phase 1: validate demand and improve the offer. Phase 2: increase marketing consistency and customer retention. Phase 3: expand channels, partnerships, and team capacity.',
        ];

        return collect($sections)
            ->filter(fn ($section) => isset($templates[$section]))
            ->mapWithKeys(fn ($section) => [$section => $templates[$section]])
            ->all();
    }

    public function show(Request $request, $id)
    {
        $report = Report::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->with('project')
            ->firstOrFail();

        $report->score = $this->calculateReportScore($report);

        return response()->json($report);
    }

    private function calculateReportScore(Report $report): int
    {
        $selectedSections = is_array($report->selected_sections) ? $report->selected_sections : [];
        $contentSections = is_array($report->sections) ? $report->sections : [];

        $normalizedSelected = collect($selectedSections)
            ->map(fn ($section) => strtolower((string) $section))
            ->reject(fn ($section) => $section === 'bundle')
            ->values();

        $expectedSections = $normalizedSelected->isNotEmpty()
            ? $normalizedSelected
            : collect(array_keys($contentSections))
                ->map(fn ($section) => strtolower((string) $section))
                ->values();

        $expectedCount = max(1, $expectedSections->count());
        $presentCount = $expectedSections
            ->filter(fn ($section) => isset($contentSections[$section]) && trim((string) $contentSections[$section]) !== '')
            ->count();

        $completionRatio = min(1, $presentCount / $expectedCount);

        $totalLength = collect($contentSections)
            ->map(fn ($value) => mb_strlen(trim((string) $value)))
            ->sum();

        // 3,000 chars is treated as full detail for scoring purposes.
        $detailRatio = min(1, $totalLength / 3000);

        // Weighted: completion is more important than verbosity.
        $rawScore = (0.7 * $completionRatio) + (0.3 * $detailRatio);
        $score = (int) round($rawScore * 100);

        // Keep a practical floor for valid generated reports.
        return max(40, min(100, $score));
    }
}
