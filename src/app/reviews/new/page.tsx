import ReviewForm from '@/components/reviews/ReviewForm';
import { protectRoute } from '@/lib/auth';

export default async function NewReviewPage() {
  await protectRoute();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-4">Add a New Book Review</h1>
        <ReviewForm />
      </div>
    </main>
  );
}
