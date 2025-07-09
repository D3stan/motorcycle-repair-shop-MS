<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

abstract class BaseAdminController extends Controller
{
    /**
     * Ensure the user has the expected type.
     *
     * @param User $user
     * @param string $expectedType
     * @return void
     */
    protected function ensureUserType(User $user, string $expectedType): void
    {
        if ($user->type !== $expectedType) {
            abort(404, "User is not a {$expectedType}");
        }
    }

    /**
     * Check if user can be deleted (no active work orders).
     *
     * @param User $user
     * @return array{canDelete: bool, message: string|null}
     */
    protected function canDeleteUser(User $user): array
    {
        $activeWorkOrders = $user->workOrders()
            ->whereIn('status', ['pending', 'in_progress'])
            ->count();

        if ($activeWorkOrders > 0) {
            return [
                'canDelete' => false,
                'message' => 'Cannot delete user with active work orders.',
            ];
        }

        // For mechanics, also check assigned work orders
        if ($user->isMechanic()) {
            $assignedActiveWorkOrders = $user->assignedWorkOrders()
                ->whereIn('status', ['pending', 'in_progress'])
                ->count();

            if ($assignedActiveWorkOrders > 0) {
                return [
                    'canDelete' => false,
                    'message' => 'Cannot delete staff member with active work orders. Please reassign or complete work orders first.',
                ];
            }
        }

        return [
            'canDelete' => true,
            'message' => null,
        ];
    }

    /**
     * Format basic user data for frontend.
     *
     * @param User $user
     * @return array
     */
    protected function formatBasicUserData(User $user): array
    {
        return [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'phone' => $user->phone,
            'tax_code' => $user->tax_code,
        ];
    }

    /**
     * Format user data with additional details for show pages.
     *
     * @param User $user
     * @return array
     */
    protected function formatDetailedUserData(User $user): array
    {
        return [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'phone' => $user->phone,
            'tax_code' => $user->tax_code,
            'created_at' => $user->created_at->format('Y-m-d H:i'),
        ];
    }

    /**
     * Create a standardized success redirect response.
     *
     * @param string $route
     * @param mixed $routeParams
     * @param string $message
     * @return RedirectResponse
     */
    protected function successRedirect(string $route, $routeParams = null, string $message = 'Operation completed successfully!'): RedirectResponse
    {
        $redirect = $routeParams ? redirect()->route($route, $routeParams) : redirect()->route($route);
        return $redirect->with('success', $message);
    }

    /**
     * Create a standardized error redirect response.
     *
     * @param string $route
     * @param mixed $routeParams
     * @param string $message
     * @return RedirectResponse
     */
    protected function errorRedirect(string $route, $routeParams = null, string $message = 'Operation failed!'): RedirectResponse
    {
        $redirect = $routeParams ? redirect()->route($route, $routeParams) : redirect()->route($route);
        return $redirect->with('error', $message);
    }

    /**
     * Get users with counts for index pages.
     *
     * @param string $userType
     * @param array $withCounts
     * @param array $withRelations
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    protected function getUsersWithCounts(string $userType, array $withCounts = [], array $withRelations = [], int $perPage = 20)
    {
        return User::where('type', $userType)
            ->withCount($withCounts)
            ->with($withRelations)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
} 