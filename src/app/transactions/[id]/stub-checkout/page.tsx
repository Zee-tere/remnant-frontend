import { redirect } from "next/navigation";

export default async function RetiredStubCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/transactions/${id}`);
}
