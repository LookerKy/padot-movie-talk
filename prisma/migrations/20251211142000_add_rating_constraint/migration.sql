ALTER TABLE "reviews" ADD CONSTRAINT "rating_range" CHECK ("rating" >= 0 AND "rating" <= 5);
