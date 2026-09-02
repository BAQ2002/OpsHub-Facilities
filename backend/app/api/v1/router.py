from fastapi import APIRouter

from .checklist.router import router as checklist_router
from .membership.router import router as membership_router
from .organization.router import router as organization_router
from .request.router import router as request_router
from .request_task.router import router as request_task_router
from .service_catalog.router import router as service_catalog_router

router = APIRouter()
router.include_router(checklist_router, prefix="/checklists", tags=["checklist"])
router.include_router(membership_router, prefix="/memberships", tags=["membership"])
router.include_router(
    organization_router, prefix="/organization", tags=["organization"]
)
router.include_router(request_router, prefix="/requests", tags=["request"])
router.include_router(
    request_task_router, prefix="/request-tasks", tags=["request-task"]
)
router.include_router(
    service_catalog_router, prefix="/service-catalog", tags=["service-catalog"]
)
