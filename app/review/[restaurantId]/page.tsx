import ReviewForm from "@/components/ReviewForm";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  return <ReviewForm restaurantId={restaurantId} />;
}
