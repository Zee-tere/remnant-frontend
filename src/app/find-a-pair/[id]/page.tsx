import { redirect } from "next/navigation";

interface FindPairRedirectProps {
  params: Promise<{ id: string }>;
}

export default async function FindPairRedirect({ params }: FindPairRedirectProps) {
  const { id } = await params;
  redirect(`/marketplace/${id}`);
}
