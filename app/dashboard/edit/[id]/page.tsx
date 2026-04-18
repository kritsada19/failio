import EditFailurePage from "@/components/dashboard/EditFailurePage";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();

  const categoryList = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/category`, {
    next: {
      revalidate: 60
    },
  }).then((res) => res.json());

  const emotionList = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emotion`, {
    next: {
      revalidate: 60
    },
  }).then((res) => res.json());

  const failure = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/failure/${id}`, {
    cache: 'no-store',
    headers: {
      "Cookie": cookieStore.toString()
    }
  }).then((res) => {
    if (!res.ok) return null;
    return res.json();
  });

  if (!failure) {
    notFound();
  }

  return (
    <EditFailurePage
      failure={failure}
      categoryList={categoryList}
      emotionList={emotionList}
    />
  );
}