-- Update the existing listing to have a placeholder image
UPDATE listings 
SET images = ARRAY['/placeholder.svg'] 
WHERE id = 'cf6e6510-aaab-4d23-bf8e-36b23fc2dd62' AND images = '{}';

-- Select the updated record to verify
SELECT id, title, images FROM listings WHERE id = 'cf6e6510-aaab-4d23-bf8e-36b23fc2dd62';