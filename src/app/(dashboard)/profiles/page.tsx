// export const dynamic = "force-dynamic";
// export const fetchCache = "force-no-store";

import { Suspense } from "react";
import { ProfilePageClient } from "./profile-page-client";

export default function ProfilesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePageClient />
    </Suspense>
  );
}
