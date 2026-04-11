# Conversion-First Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase booking conversion by keeping the dark premium brand on public pages while moving the booking funnel to a lighter, clearer, higher-trust flow, then simplify admin styling for operational clarity.

**Architecture:** Preserve the existing Next.js route structure, server actions, and Prisma-backed behavior. Centralize the public shell, refactor the booking funnel into smaller UI pieces without changing business logic, and apply a restrained admin polish pass that improves hierarchy rather than changing workflows.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS v4, Lucide React, existing server actions in `src/actions/*`

---

## File Structure

### Public shell and landing
- Modify: `src/app/(public)/layout.tsx`
- Modify: `src/app/(public)/page.tsx`
- Create: `src/components/public/PublicHeader.tsx`
- Create: `src/components/public/PublicFooter.tsx`
- Create: `src/components/public/PublicSectionHeader.tsx`
- Create: `src/components/public/TrustBar.tsx`
- Create: `src/components/public/GallerySection.tsx`
- Create: `src/components/public/TestimonialsSection.tsx`

### Booking funnel
- Modify: `src/app/(public)/booking/page.tsx`
- Modify: `src/components/booking/BookingForm.tsx`
- Create: `src/components/booking/BookingProgress.tsx`
- Create: `src/components/booking/BookingSummary.tsx`
- Create: `src/components/booking/BookingEmptyState.tsx`

### Shared styles
- Modify: `src/app/globals.css`

### Admin polish
- Modify: `src/app/(admin)/dashboard/page.tsx`
- Modify: `src/components/admin/AppointmentsList.tsx`
- Modify: `src/components/admin/AdminSidebar.tsx`
- Create: `src/components/admin/PageHeader.tsx`
- Create: `src/components/admin/StatCard.tsx`
- Create: `src/components/ui/EmptyState.tsx`
- Create: `src/components/ui/SkeletonBlock.tsx`

### Verification
- No test files currently surfaced in the inspected repo. Verification will rely on app build/dev checks plus browser flow testing unless tests are discovered during execution.

---

## Task 1: Extract The Shared Public Shell

**Files:**
- Create: `src/components/public/PublicHeader.tsx`
- Create: `src/components/public/PublicFooter.tsx`
- Modify: `src/app/(public)/layout.tsx`
- Modify: `src/app/(public)/page.tsx`
- Modify: `src/app/(public)/booking/page.tsx`

- [ ] **Step 1: Read the current public shell duplication**
Read:
- `src/app/(public)/layout.tsx`
- `src/app/(public)/page.tsx`
- `src/app/(public)/booking/page.tsx`

Expected: navbar and footer exist only in `page.tsx`, while the public layout returns only `{children}`.

- [ ] **Step 2: Create `PublicHeader`**
Write `src/components/public/PublicHeader.tsx`:
```tsx
import Link from "next/link";
import { Calendar, Sparkles } from "lucide-react";

type PublicHeaderProps = {
  businessName: string;
};

export function PublicHeader({ businessName }: PublicHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 glass border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-bg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-heading text-lg font-bold gradient-text">
            {businessName}
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/#servicos"
            className="hidden text-sm text-gray-600 transition-colors hover:text-primary-500 dark:text-gray-300 sm:block"
          >
            Serviços
          </Link>
          <Link
            href="/#contacto"
            className="hidden text-sm text-gray-600 transition-colors hover:text-primary-500 dark:text-gray-300 sm:block"
          >
            Contacto
          </Link>
          <Link href="/booking" className="btn-primary py-2 text-sm">
            <Calendar className="mr-1 inline h-4 w-4" />
            Agendar
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create `PublicFooter`**
Write `src/components/public/PublicFooter.tsx`:
```tsx
import Link from "next/link";
import { Sparkles } from "lucide-react";

type PublicFooterProps = {
  businessName: string;
};

export function PublicFooter({ businessName }: PublicFooterProps) {
  return (
    <footer className="border-t border-gray-100 px-4 py-8 dark:border-gray-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary-500" />
          <span className="text-sm font-medium gradient-text">{businessName}</span>
        </div>
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Todos os direitos reservados.
        </p>
        <Link
          href="/login"
          className="text-sm text-gray-400 transition-colors hover:text-primary-500"
        >
          Área Admin
        </Link>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Update public layout to own the shell**
Replace `src/app/(public)/layout.tsx`:
```tsx
import { getBusinessConfig } from "@/actions/settings";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getBusinessConfig();
  const businessName = config?.businessName || "GlamNail Studio";

  return (
    <div className="min-h-screen">
      <PublicHeader businessName={businessName} />
      <main className="pt-20">{children}</main>
      <PublicFooter businessName={businessName} />
    </div>
  );
}
```

- [ ] **Step 5: Remove duplicated header/footer from landing page**
Edit `src/app/(public)/page.tsx` to delete the inline navbar and footer blocks and keep only the landing sections.

- [ ] **Step 6: Remove shell duplication from booking page**
Edit `src/app/(public)/booking/page.tsx` so it renders only booking content.

- [ ] **Step 7: Verify public shell behavior**
Run: `npm run lint`
Run app and verify in browser:
- `/`
- `/booking`

- [ ] **Step 8: Commit**
```bash
git add src/app/\(public\)/layout.tsx src/app/\(public\)/page.tsx src/app/\(public\)/booking/page.tsx src/components/public/PublicHeader.tsx src/components/public/PublicFooter.tsx
git commit -m "feat: share public site shell across pages"
```

---

## Task 2: Strengthen Landing Page Trust And Conversion

**Files:**
- Create: `src/components/public/PublicSectionHeader.tsx`
- Create: `src/components/public/TrustBar.tsx`
- Create: `src/components/public/GallerySection.tsx`
- Create: `src/components/public/TestimonialsSection.tsx`
- Modify: `src/app/(public)/page.tsx`

- [ ] **Step 1: Create reusable public section header**
Write `src/components/public/PublicSectionHeader.tsx`

- [ ] **Step 2: Create trust bar**
Write `src/components/public/TrustBar.tsx` with 4 trust items

- [ ] **Step 3: Create gallery section**
Write `src/components/public/GallerySection.tsx`

- [ ] **Step 4: Create testimonials section**
Write `src/components/public/TestimonialsSection.tsx`

- [ ] **Step 5: Rewrite landing page section composition**
- tighten hero copy
- add `TrustBar`, `GallerySection`, `TestimonialsSection`
- keep services section and contact CTA

- [ ] **Step 6: Verify landing page conversion layout**
Run browser checks: hero CTA visible fast, trust content appears before contact footer

- [ ] **Step 7: Commit**
```bash
git add src/app/\(public\)/page.tsx src/components/public/
git commit -m "feat: add trust-focused public landing sections"
```

---

## Task 3: Reframe Booking Page Into A Mixed Theme Funnel

**Files:**
- Modify: `src/app/(public)/booking/page.tsx`
- Modify: `src/components/booking/BookingForm.tsx`
- Create: `src/components/booking/BookingProgress.tsx`
- Create: `src/components/booking/BookingSummary.tsx`

- [ ] **Step 1: Create booking progress component**
Write `src/components/booking/BookingProgress.tsx`

- [ ] **Step 2: Create booking summary component**
Write `src/components/booking/BookingSummary.tsx`

- [ ] **Step 3: Restructure booking page layout**
Edit `src/app/(public)/booking/page.tsx` with branded header, 2-column layout with summary sidebar

- [ ] **Step 4: Wire booking progress and summary into `BookingForm`**
Import components, derive selected service details

- [ ] **Step 5: Replace single-column wrapper with two-column layout**
```tsx
<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
  <div className="space-y-6">
    <BookingProgress step={step} items={steps} />
  </div>
  <div className="lg:sticky lg:top-28 lg:self-start">
    <BookingSummary ... />
  </div>
</div>
```

- [ ] **Step 6: Lighten the step cards**
Replace `className="card p-6 animate-fade-in"` with:
```tsx
className="animate-fade-in rounded-[2rem] border border-primary-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
```

- [ ] **Step 7: Verify booking mixed-theme layout**
Run lint and browser check

- [ ] **Step 8: Commit**
```bash
git add src/app/\(public\)/booking/page.tsx src/components/booking/BookingForm.tsx src/components/booking/BookingProgress.tsx src/components/booking/BookingSummary.tsx
git commit -m "feat: redesign booking funnel layout"
```

---

## Task 4: Improve Service Selection Clarity

**Files:**
- Modify: `src/components/booking/BookingForm.tsx`

- [ ] **Step 1: Update service cards to feel like selectable products**
Use:
```tsx
className={`group rounded-[1.5rem] border p-4 text-left transition-all ${
  selectedServices.includes(s.id)
    ? "border-primary-500 bg-primary-50 shadow-sm dark:bg-primary-900/20"
    : "border-gray-200 bg-white hover:border-primary-200 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900"
}`}
```

- [ ] **Step 2: Tighten typography in service cards**
```tsx
<p className="font-medium text-gray-900 dark:text-white">{s.name}</p>
```

- [ ] **Step 3: Improve selected-state signal**
Use a circular checkmark indicator.

- [ ] **Step 4: Remove the small summary bar under the services grid**
Delete the inline summary block.

- [ ] **Step 5: Verify selection UX**

- [ ] **Step 6: Commit**
```bash
git add src/components/booking/BookingForm.tsx
git commit -m "feat: improve booking service selection clarity"
```

---

## Task 5: Redesign Date And Time Step With Strong Recovery States

**Files:**
- Modify: `src/components/booking/BookingForm.tsx`
- Create: `src/components/booking/BookingEmptyState.tsx`

- [ ] **Step 1: Create reusable booking empty state**
Write `src/components/booking/BookingEmptyState.tsx`

- [ ] **Step 2: Use the new empty state in step 2**
Replace the current empty slot paragraph with the empty state component.

- [ ] **Step 3: Add helper copy above the date input**
```tsx
<p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
  Escolha uma data e confirme o horário com melhor encaixe para si.
</p>
```

- [ ] **Step 4: Improve date field presentation**
Wrap the date field with a border container and show business hours from config.

- [ ] **Step 5: Improve slot grid presentation**
- Add label before the grid
- Use `grid-cols-3 sm:grid-cols-4 lg:grid-cols-5`
- Improve slot button styling

- [ ] **Step 6: Add pre-selection empty state**
Before a date is chosen, render:
```tsx
<BookingEmptyState
  title="Escolha primeiro uma data"
  description="Assim que selecionar o dia, verá os horários disponíveis."
/>
```

- [ ] **Step 7: Add loading skeleton for slots**
```tsx
<div className="flex items-center justify-center gap-2 py-8">
  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500/30 border-t-primary-500" />
  <span className="text-sm text-gray-500">A carregar horários...</span>
</div>
```

- [ ] **Step 8: Verify date/time step behavior**

- [ ] **Step 9: Commit**
```bash
git add src/components/booking/BookingForm.tsx src/components/booking/BookingEmptyState.tsx
git commit -m "feat: redesign booking date/time step with recovery states"
```

---

## Task 6: Upgrade Booking Success And Error Feedback

**Files:**
- Modify: `src/components/booking/BookingForm.tsx`

- [ ] **Step 1: Improve success state**
Replace success rendering with:
```tsx
<div className="animate-fade-in rounded-[2rem] border border-emerald-200 bg-white p-8 text-center dark:border-emerald-800 dark:bg-gray-900">
  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 shadow-lg shadow-emerald-500/20 dark:bg-emerald-900/30">
    <Check className="h-8 w-8 text-emerald-500" />
  </div>
  <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
    Agendamento Confirmado!
  </h2>
  <p className="mx-auto mt-3 max-w-md text-gray-500 dark:text-gray-400">
    O seu tratamento foi reservado com sucesso. Receberá uma confirmação em breve.
  </p>

  <div className="mx-auto mt-8 max-w-sm rounded-2xl bg-gray-50 p-5 dark:bg-gray-800/50">
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-500">Data</span>
        <span className="font-medium">{selectedDate}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Hora</span>
        <span className="font-medium">{selectedTime}</span>
      </div>
      <div className="flex justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
        <span className="font-semibold">Total</span>
        <span className="font-bold gradient-text">{formatCurrency(totalPrice)}</span>
      </div>
    </div>
  </div>

  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
    <Link href="/" className="btn-primary inline-flex items-center gap-2">
      <Sparkles className="h-4 w-4" /> Voltar ao Início
    </Link>
  </div>
</div>
```

- [ ] **Step 2: Add error state handling**
Wrap the submission in try/catch and show a toast/alert:
```tsx
const [error, setError] = useState<string | null>(null);

const handleSubmit = async () => {
  setSubmitting(true);
  setError(null);
  try {
    // ... existing submission
    setSuccess(true);
  } catch (err) {
    setError("Não foi possível criar o agendamento. Tente novamente ou contacte-nos.");
  } finally {
    setSubmitting(false);
  }
};
```

Display error above the action buttons:
```tsx
{error && (
  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
    {error}
  </div>
)}
```

- [ ] **Step 3: Verify error and success feedback**
Browser test booking flow to completion.

- [ ] **Step 4: Commit**
```bash
git add src/components/booking/BookingForm.tsx
git commit -m "feat: improve booking feedback states"
```

---

## Task 7: Add Shared UI Primitives

**Files:**
- Create: `src/components/ui/EmptyState.tsx`
- Create: `src/components/ui/SkeletonBlock.tsx`

- [ ] **Step 1: Create reusable empty state**
Write `src/components/ui/EmptyState.tsx`:
```tsx
type EmptyStateProps = {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
        <Icon className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Create reusable skeleton**
Write `src/components/ui/SkeletonBlock.tsx`:
```tsx
type SkeletonBlockProps = {
  className?: string;
};

export function SkeletonBlock({ className = "" }: SkeletonBlockProps) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`} />
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add src/components/ui/EmptyState.tsx src/components/ui/SkeletonBlock.tsx
git commit -m "feat: add shared UI primitives"
```

---

## Task 8: Admin Visual Restraint Pass

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/(admin)/dashboard/page.tsx`
- Modify: `src/components/admin/AppointmentsList.tsx`
- Modify: `src/components/admin/AdminSidebar.tsx`

- [ ] **Step 1: Add admin-specific card style**
In `globals.css`, add:
```css
@layer components {
  .card-admin {
    @apply rounded-2xl border border-gray-200 bg-white p-5 shadow-sm
    dark:border-gray-800 dark:bg-gray-900;
  }

  .stat-card-admin {
    @apply rounded-2xl border border-gray-100 bg-white p-5 shadow-sm
    dark:border-gray-800 dark:bg-gray-900;
  }
}
```

- [ ] **Step 2: Simplify dashboard stat cards**
In `src/app/(admin)/dashboard/page.tsx`, replace stat card styles:
```tsx
className="stat-card-admin"
```
Remove gradient backgrounds from icons, use simple solid backgrounds:
```tsx
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
  <stat.icon className="h-5 w-5 text-gray-500" />
</div>
```

- [ ] **Step 3: Simplify appointments list cards**
In `src/components/admin/AppointmentsList.tsx`, replace:
```tsx
className="card p-5"
```
with:
```tsx
className="card-admin"
```

- [ ] **Step 4: Reduce sidebar visual weight**
In `src/components/admin/AdminSidebar.tsx`, simplify brand section and user area, remove excessive shadow and gradient.

- [ ] **Step 5: Verify admin visual changes**
Run app and check:
- `/dashboard`
- `/appointments`
- Sidebar on mobile and desktop

- [ ] **Step 6: Commit**
```bash
git add src/app/globals.css src/app/\(admin\)/dashboard/page.tsx src/components/admin/AppointmentsList.tsx src/components/admin/AdminSidebar.tsx
git commit -m "feat: apply admin visual restraint"
```

---

## Task 9: Final Browser Verification

**Files:**
- Run verification commands

- [ ] **Step 1: Run full app verification**
```bash
npm run lint
npm run build
```

- [ ] **Step 2: Test public pages**
- `/` - landing page loads, header/footer shared, trust sections present
- `/booking` - mixed-theme layout, progress, summary visible

- [ ] **Step 3: Test booking flow end-to-end**
- Select service
- Select date
- Select time slot
- Fill client info
- Submit
- Verify success state

- [ ] **Step 4: Test admin pages**
- `/dashboard` - cleaner stat cards
- `/appointments` - more scannable list

- [ ] **Step 5: Commit final verification**
```bash
git add -A
git commit -m "feat: complete conversion-first redesign - verification pass"
```

---

## Success Criteria

- [ ] Public shell is shared across all public pages
- [ ] Landing page has trust sections and feels premium
- [ ] Booking funnel uses mixed theme with lighter cards
- [ ] Sticky summary is always visible on desktop
- [ ] Service selection is clear and product-like
- [ ] Date/time step has proper loading and empty states
- [ ] Booking success state feels conclusive
- [ ] Booking errors surface to the user
- [ ] Admin pages look more restrained and operational

---

## Dependencies Between Tasks

1. **Task 1** must complete before Task 2 can use the shared header/footer
2. **Task 3** builds on Task 1's shell and introduces the new booking components
3. **Task 4** refines Task 3's service selection
4. **Task 5** refines Task 3's date/time step
5. **Task 6** completes Task 3's feedback handling
6. **Task 7** provides reusable components for any remaining gaps
7. **Task 8** can run in parallel after Task 1 since it touches admin surfaces separately
8. **Task 9** verifies everything end-to-end

---

## Recommended Execution

Start with Task 1, then move through tasks 2-7 in order. Task 8 can run alongside or after. Task 9 is the final gate before calling the redesign complete.