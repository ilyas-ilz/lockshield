import * as React from "react";

/**
 * Card grid that centres an incomplete final row.
 *
 * WHY it is a 6-column grid and not a 3-column one: with three equal columns,
 * a last row holding one or two cards sticks to the left and leaves an
 * obvious hole on the right — which is common once a listing is paginated
 * (14 services over pages of 9 leaves 5 on page 2). Two cards cannot be
 * centred across three tracks without a half-track offset, so the grid is
 * doubled to six tracks and every card spans two. A leftover pair then starts
 * at track 2 (covering 2-5) and a single leftover starts at track 3
 * (covering 3-4), both optically centred. Same trick at `sm`, where four
 * tracks give two cards per row.
 *
 * Column widths and gaps are unchanged from the plain 3-up grid, so nothing
 * about a full row moves.
 */
export function CardGrid({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children);
  const count = items.length;

  // How many cards sit in the final row at each breakpoint (0 = row is full).
  const lgRemainder = count % 3;
  const smRemainder = count % 2;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 lg:grid-cols-6 lg:gap-8">
      {items.map((child, index) => {
        const isLastRowLg = lgRemainder !== 0 && index >= count - lgRemainder;
        const isFirstOfLastRowLg = isLastRowLg && index === count - lgRemainder;

        // A lone card centres on track 3; a pair starts on track 2.
        const lgStart = isFirstOfLastRowLg
          ? lgRemainder === 1
            ? "lg:col-start-3"
            : "lg:col-start-2"
          : "";

        const isLoneOnLastRowSm = smRemainder === 1 && index === count - 1;
        const smStart = isLoneOnLastRowSm ? "sm:col-start-2" : "";

        // `h-full` + `[&>*]:h-full` keep the equal-height chain intact: this
        // wrapper is now the grid item that stretches to the row, and the
        // card's own `h-full` has to resolve against something with a real
        // height or every card collapses to its own content.
        return (
          <div
            key={index}
            className={`h-full [&>*]:h-full sm:col-span-2 lg:col-span-2 ${smStart} ${lgStart}`.trim()}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
