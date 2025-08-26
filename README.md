# Farm Production Record Management Application

A comprehensive web application for managing farm production records, including plots, rows, and planting data.

## Features

- **Dashboard**: Overview of farm statistics and recent activities
- **Plots Management**: Create, edit, and delete plots with categorization
- **Rows Management**: Track planting rows with details like variety, planting date, and expected harvest
- **Voice Commands**: Control the application using voice commands
- **Category System**: Organize plots by categories with custom colors

## Technology Stack

- **Frontend**: React with TypeScript
- **UI Framework**: Custom UI with Tailwind CSS
- **Backend**: Supabase for database and authentication
- **API**: RESTful endpoints for data operations
- **Voice Recognition**: Web Speech API for voice commands

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Cujoloki/ighjgfjkhgjkug.git
   cd ighjgfjkhgjkug
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Database Schema

The application uses the following database tables:

- **plots**: Stores information about farm plots
  - id (UUID, primary key)
  - name (text)
  - description (text, optional)
  - category_id (UUID, foreign key to plot_categories)
  - created_at (timestamp)
  - updated_at (timestamp)

- **plot_categories**: Categories for organizing plots
  - id (UUID, primary key)
  - name (text)
  - description (text, optional)
  - color (text, hex color code)
  - created_at (timestamp)

- **rows**: Stores information about planting rows
  - id (UUID, primary key)
  - plot_id (UUID, foreign key to plots)
  - name (text)
  - variety (text, optional)
  - planted_date (date, optional)
  - expected_harvest (date, optional)
  - notes (text, optional)
  - created_at (timestamp)
  - updated_at (timestamp)

## Voice Commands

The application supports the following voice commands:

- "show plots" - Navigate to plots page
- "show rows" - Navigate to rows page
- "add new plot" - Go to plots page to add new plot
- "add new row" - Go to rows page to add new row
- "refresh dashboard" - Refresh dashboard data
- "go home" - Navigate to dashboard
- "show statistics" - Show current statistics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.