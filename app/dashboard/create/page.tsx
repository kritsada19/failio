import { env } from "@/env";
import CreateFailurePage from "@/components/dashboard/CreateFailurePage";

export default async function Page() {

  const categoryList = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/category`, {
    next: {
      revalidate: 3600
    },
  }).then((res) => res.json());
  const emotionList = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/emotion`, {
    next: {
      revalidate: 3600 
    },
  }).then((res) => res.json());

  return (
    <CreateFailurePage
      categoryList={categoryList}
      emotionList={emotionList}
    />
  );
}
