import RestaurantView from "@/components/RestaurantView";

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RestaurantView id={id} />;
}
