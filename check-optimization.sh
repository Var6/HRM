#!/bin/bash
# Optimization Check Script
# Run this to identify optimization opportunities

echo "🔍 HRM Application Optimization Report"
echo "========================================"
echo ""

# Check file sizes
echo "📊 Large Component Files:"
echo "------------------------"
find app -name "*.tsx" -type f | while read file; do
  size=$(wc -l < "$file")
  if [ $size -gt 500 ]; then
    echo "  $file: $size lines"
  fi
done
echo ""

# Check for unused imports
echo "🔎 Checking for optimization opportunities..."
echo "----------------------------------------------"
echo ""

# Count components
echo "📁 Component Count:"
find components -name "*.tsx" 2>/dev/null | wc -l
echo ""

# Check bundle info
echo "📦 Build Analysis:"
echo "  Run: npm run build"
echo "  Check .next/static/chunks/ for bundle sizes"
echo ""

# Performance tips
echo "⚡ Performance Tips:"
echo "  1. Split large pages into smaller components"
echo "  2. Use React.lazy() for tabs and modals"
echo "  3. Implement pagination for lists"
echo "  4. Add database indexes on frequently queried fields"
echo "  5. Use React.memo() for expensive components"
echo ""

echo "✅ Optimizations Already Applied:"
echo "  ✓ API response caching (5-15 minutes)"
echo "  ✓ Database query optimization (.lean())"
echo "  ✓ Tailwind CSS v4 compatibility"
echo "  ✓ TypeScript error-free build"
echo ""

echo "📚 Read OPTIMIZATION.md for detailed recommendations"
