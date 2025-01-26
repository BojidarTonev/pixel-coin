# Pixel Art Generator

A web application that generates pixel art images from text descriptions using AI. Built with Next.js, Replicate, Supabase, and Redux Toolkit.

## Features

- Generate pixel art images from text descriptions
- View gallery of all generated images
- Download generated images
- Share images on social media
- Responsive design
- Modern UI with smooth animations

## Tech Stack

- Next.js 14 with App Router
- Redux Toolkit for state management
- Replicate AI for image generation
- Supabase for image storage
- Tailwind CSS for styling
- Shadcn UI components
- TypeScript

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd pixel-coin
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:

```
REPLICATE_API_TOKEN=your_replicate_api_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

4. Create a Supabase table named `generated_images` with the following schema:

```sql
create table generated_images (
  id text primary key,
  url text not null,
  prompt text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

- `REPLICATE_API_TOKEN`: Your Replicate API token (get it from [replicate.com](https://replicate.com))
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key (used for database operations)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
