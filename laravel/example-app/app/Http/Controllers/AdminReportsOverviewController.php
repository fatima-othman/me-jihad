<?php

namespace App\Http\Controllers;
use App\Models\Project;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminReportsOverviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $this->getFilters($request);

        $reports = $this->buildFilteredReportsCollection($filters);

        $projects = Project::query()
            ->withCount('reports')
            ->with('user:id,name,email')
            ->orderByDesc('reports_count')
            ->get()
            ->map(function (Project $project): array {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'business_name' => $project->name,
                    'business_type' => $project->business_type,
                    'industry' => $project->business_type,
                    'description' => $project->description,
                    'stage' => $project->stage,
                    'employees' => $project->employees,
                    'budget' => $project->budget,
                    'market' => $project->market,
                    'competitors' => $project->competitors,
                    'language' => $project->language,
                    'owner_name' => $project->user?->name,
                    'owner_email' => $project->user?->email,
                    'reports_count' => $project->reports_count,
                ];
            })
            ->values();

        $allReports = Report::query()->get();

        $languageCounts = $allReports
            ->groupBy(fn (Report $report): string => $this->reportLanguage($report))
            ->mapWithKeys(fn ($group, $language) => [$language => $group->count()])
            ->all();

        return response()->json([
            'filters' => $filters,
            'stats' => [
                'total_users' => User::count(),
                'total_projects' => $projects->count(),
                'projects_total' => $projects->count(),
                'total_reports' => $allReports->count(),
                'credits_sold' => User::sum('credit_balance'),
                'filtered_reports' => $reports->count(),
                'today_reports' => $allReports->filter(fn (Report $report) => $report->created_at?->isToday())->count(),
                'this_week_reports' => $allReports->filter(fn (Report $report) => $report->created_at?->isAfter(now()->startOfWeek()->subSecond()))->count(),
            ],
            'daily_report_counts' => $this->buildDailyCounts($allReports),
            'weekly_report_counts' => $this->buildWeeklyCounts($allReports),
            'weekly_activity' => $this->buildWeeklyActivity($allReports),
            'language_counts' => $languageCounts,
            'business_type_counts' => $this->buildIndustryCounts(),
            'top_projects' => $this->buildTopProjects(),
            'top_users' => $this->buildTopUsers(),
            'projects' => $projects,
            'reports' => $reports->map(fn (Report $report): array => $this->transformReport($report))->values(),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $this->getFilters($request);

        $reports = $this->buildFilteredReportsCollection($filters);

        $fileName = 'filtered-reports-'.now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($reports): void {
            $handle = fopen('php://output', 'wb');

            fputcsv($handle, [
                'Report ID',
                'Title',
                'Project',
                'Business',
                'Type',
                'Language',
                'Status',
                'Pages',
                'Submitted By',
                'Submitted By Email',
                'Generated At',
            ]);

            foreach ($reports as $report) {
                $reportData = $this->transformReport($report);

                fputcsv($handle, [
                    $reportData['report_code'],
                    $reportData['title'],
                    $reportData['project_name'],
                    $reportData['business_name'],
                    $reportData['type'],
                    $reportData['language'],
                    $reportData['status'],
                    $reportData['pages'],
                    $reportData['submitted_by'],
                    $reportData['submitted_by_email'],
                    $reportData['generated_at'],
                ]);
            }

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Get filter options for dropdown menus
     */
    public function filterOptions(): JsonResponse
    {
        $reports = Report::query()->get();
        $reportTypes = $reports
            ->map(fn (Report $report): string => $this->reportType($report))
            ->filter()
            ->unique()
            ->values()
            ->all();
        $languages = $reports
            ->map(fn (Report $report): string => $this->reportLanguage($report))
            ->filter()
            ->unique()
            ->values()
            ->all();

        return response()->json([
            'types' => ['All Types', ...array_filter($reportTypes, fn ($type) => !empty($type))],
            'languages' => ['All Languages', ...array_filter($languages, fn ($lang) => !empty($lang))],
            'statuses' => ['completed', 'pending', 'failed', 'processing'],
        ]);
    }

    /**
     * Get detailed analytics summary
     */
    public function analytics(Request $request): JsonResponse
    {
        $filters = $this->getFilters($request);
        $allReports = Report::query()->get();
        $filteredReports = $this->buildFilteredReportsCollection($filters);

        $statusDistribution = $filteredReports->groupBy(fn (Report $report): string => $this->reportStatus($report))->map->count();
        $typeDistribution = $filteredReports->groupBy(fn (Report $report): string => $this->reportType($report))->map->count();
        $languageDistribution = $filteredReports->groupBy(fn (Report $report): string => $this->reportLanguage($report))->map->count();

        return response()->json([
            'summary' => [
                'total_reports' => $allReports->count(),
                'filtered_reports' => $filteredReports->count(),
                'total_pages' => $filteredReports->sum('credits_used'),
                'average_pages' => $filteredReports->count() > 0 ? round($filteredReports->avg('credits_used'), 2) : 0,
                'total_projects' => Project::count(),
            ],
            'distributions' => [
                'by_status' => $statusDistribution,
                'by_type' => $typeDistribution,
                'by_language' => $languageDistribution,
            ],
            'trends' => [
                'today' => $allReports->filter(fn (Report $r) => $r->created_at?->isToday())->count(),
                'this_week' => $allReports->filter(fn (Report $r) => $r->created_at?->isAfter(now()->startOfWeek()->subSecond()))->count(),
                'this_month' => $allReports->filter(fn (Report $r) => $r->created_at?->isAfter(now()->startOfMonth()->subSecond()))->count(),
            ],
        ]);
    }

    private function getFilters(Request $request): array
    {
        return [
            'search' => trim((string) $request->query('search', '')),
            'type' => trim((string) $request->query('type', 'All Types')),
            'language' => trim((string) $request->query('language', 'All Languages')),
            'from' => trim((string) $request->query('from', '')),
            'to' => trim((string) $request->query('to', '')),
        ];
    }

    private function buildFilteredReportsCollection(array $filters): Collection
    {
        return Report::query()
            ->with(['project:id,name,business_type', 'user:id,name,email'])
            ->orderByDesc('created_at')
            ->get()
            ->filter(function (Report $report) use ($filters): bool {
                if ($filters['search'] !== '') {
                    $haystack = strtolower(implode(' ', [
                        $this->reportCode($report),
                        $this->reportTitle($report),
                        $this->reportType($report),
                        $report->project?->name,
                        $report->project?->business_type,
                        $report->user?->name,
                        $report->user?->email,
                    ]));

                    if (! str_contains($haystack, strtolower($filters['search']))) {
                        return false;
                    }
                }

                if ($filters['type'] !== 'All Types' && $this->reportType($report) !== $filters['type']) {
                    return false;
                }

                if ($filters['language'] !== 'All Languages' && $this->reportLanguage($report) !== $filters['language']) {
                    return false;
                }

                if ($filters['from'] !== '' && $report->created_at?->toDateString() < $filters['from']) {
                    return false;
                }

                if ($filters['to'] !== '' && $report->created_at?->toDateString() > $filters['to']) {
                    return false;
                }

                return true;
            })
            ->values();
    }

    private function transformReport(Report $report): array
    {
        return [
            'id' => $report->id,
            'report_code' => $this->reportCode($report),
            'title' => $this->reportTitle($report),
            'type' => $this->reportType($report),
            'language' => $this->reportLanguage($report),
            'status' => $this->reportStatus($report),
            'pages' => $report->credits_used,
            'credits_used' => $report->credits_used,
            'sections' => $report->sections,
            'selected_sections' => $report->selected_sections,
            'generated_at' => optional($report->created_at)->toDateString(),
            'project_name' => $report->project?->name,
            'business_name' => $report->project?->name,
            'business_type' => $report->project?->business_type,
            'industry' => $report->project?->business_type,
            'submitted_by' => $report->user?->name,
            'submitted_by_email' => $report->user?->email,
        ];
    }

    private function buildDailyCounts(Collection $reports): array
    {
        return collect(range(6, 0))
            ->map(function (int $daysAgo) use ($reports): array {
                $date = now()->subDays($daysAgo);

                return [
                    'date' => $date->toDateString(),
                    'label' => $date->format('D'),
                    'count' => $reports->filter(
                        fn (Report $report) => $report->created_at?->isSameDay($date)
                    )->count(),
                ];
            })
            ->values()
            ->all();
    }

    private function buildWeeklyCounts(Collection $reports): array
    {
        return collect(range(3, 0))
            ->map(function (int $weeksAgo) use ($reports): array {
                $weekStart = now()->startOfWeek()->subWeeks($weeksAgo)->copy();
                $weekEnd = $weekStart->copy()->endOfWeek();

                return [
                    'label' => $weekStart->format('M d'),
                    'count' => $reports->filter(function (Report $report) use ($weekStart, $weekEnd): bool {
                        $generatedAt = $report->created_at;

                        return $generatedAt !== null
                            && $generatedAt->betweenIncluded($weekStart, $weekEnd);
                    })->count(),
                ];
            })
            ->values()
            ->all();
    }

    private function buildWeeklyActivity(Collection $reports): array
    {
        return collect(range(3, 0))
            ->map(function (int $weeksAgo) use ($reports): array {
                $weekStart = now()->startOfWeek()->subWeeks($weeksAgo)->copy();
                $weekEnd = $weekStart->copy()->endOfWeek();

                return [
                    'label' => $weekStart->format('M d'),
                    'total' => $reports->filter(function (Report $report) use ($weekStart, $weekEnd): bool {
                        $generatedAt = $report->created_at;

                        return $generatedAt !== null
                            && $generatedAt->betweenIncluded($weekStart, $weekEnd);
                    })->count(),
                    'Arabic' => $reports->filter(function (Report $report) use ($weekStart, $weekEnd): bool {
                        $generatedAt = $report->created_at;

                        return $generatedAt !== null
                            && $generatedAt->betweenIncluded($weekStart, $weekEnd)
                            && strtolower($this->reportLanguage($report)) === 'arabic';
                    })->count(),
                    'English' => $reports->filter(function (Report $report) use ($weekStart, $weekEnd): bool {
                        $generatedAt = $report->created_at;

                        return $generatedAt !== null
                            && $generatedAt->betweenIncluded($weekStart, $weekEnd)
                            && strtolower($this->reportLanguage($report)) === 'english';
                    })->count(),
                ];
            })
            ->values()
            ->all();
    }

    private function buildIndustryCounts(): array
    {
        return DB::table('reports')
            ->join('projects', 'projects.id', '=', 'reports.project_id')
            ->select('projects.business_type as industry', DB::raw('count(*) as count'))
            ->groupBy('projects.business_type')
            ->orderByDesc('count')
            ->limit(6)
            ->get()
            ->map(function ($row): array {
                return [
                    'industry' => $row->industry ?? 'Unknown',
                    'count' => $row->count,
                ];
            })
            ->values()
            ->all();
    }

    private function buildTopProjects(): array
    {
        return Project::query()
            ->withCount('reports')
            ->orderByDesc('reports_count')
            ->limit(5)
            ->get()
            ->map(function (Project $project): array {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'business_name' => $project->name,
                    'business_type' => $project->business_type,
                    'industry' => $project->business_type,
                    'stage' => $project->stage,
                    'employees' => $project->employees,
                    'budget' => $project->budget,
                    'language' => $project->language,
                    'reports_count' => $project->reports_count,
                ];
            })
            ->values()
            ->all();
    }

    private function buildTopUsers(): array
    {
        return DB::table('reports')
            ->join('users', 'users.id', '=', 'reports.user_id')
            ->select('users.id', 'users.name', 'users.email', DB::raw('count(reports.id) as reports_count'))
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('reports_count')
            ->limit(5)
            ->get()
            ->map(function ($row): array {
                return [
                    'id' => $row->id,
                    'name' => $row->name,
                    'email' => $row->email,
                    'reports_count' => $row->reports_count,
                ];
            })
            ->values()
            ->all();
    }

    private function reportCode(Report $report): string
    {
        return (string) ($report->sections['code'] ?? 'RPT-'.str_pad((string) $report->id, 4, '0', STR_PAD_LEFT));
    }

    private function reportTitle(Report $report): string
    {
        return (string) ($report->sections['title'] ?? ($report->selected_sections[1] ?? 'Generated Report'));
    }

    private function reportType(Report $report): string
    {
        return (string) ($report->sections['type'] ?? ($report->selected_sections[0] ?? 'General'));
    }

    private function reportLanguage(Report $report): string
    {
        return (string) ($report->sections['language'] ?? $report->project?->language ?? 'English');
    }

    private function reportStatus(Report $report): string
    {
        return (string) ($report->sections['status'] ?? 'completed');
    }
}
