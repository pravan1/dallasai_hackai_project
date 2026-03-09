"""
Lightweight user context for FastAPI when Auth is disabled.

The demotest branch runs without Auth0 or any external identity
provider. All routes that previously depended on get_current_user
now receive a fixed anonymous user dictionary instead.
"""

from typing import Optional


def get_current_user() -> Optional[dict]:
  """
  FastAPI dependency — call as:  user: dict | None = Depends(get_current_user)

  In this branch, authentication is disabled and a static anonymous
  user is always returned.
  """
  return {
      "sub": "anonymous",
      "email": "anonymous@learnflow.ai",
      "name": "Anonymous User",
  }

