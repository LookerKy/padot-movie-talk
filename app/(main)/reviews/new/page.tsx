import { getTagsAction } from "@/app/actions/tag";
import { NewReviewClient } from "./client";

export const dynamic = "force-dynamic";

export default async function NewReviewPage() {
    const tagRes = await getTagsAction();
    const availableTags = tagRes.success && tagRes.data ? tagRes.data : [];

    return <NewReviewClient availableTags={availableTags} />;
}
