---
title: "When to Use CDS Table Functions with AMDP"
date: 2025-11-20
description: "Understanding the right scenarios for CDS table functions backed by AMDP methods, and when a pure CDS view is sufficient."
tags: ["SAP", "ABAP", "CDS", "AMDP", "Performance"]
---

## The Decision Matrix

One of the most common questions I get during code reviews: "Should this be a pure CDS view or a CDS table function with AMDP?"

The answer depends on what you're trying to achieve.

## Pure CDS Views – When They're Enough

Use standard CDS views when your logic involves:

- Joins and associations
- Filters and aggregations
- Case expressions and calculated fields
- Built-in CDS functions

```abap
@AbapCatalog.sqlViewName: 'ZV_SALES_ORDERS'
define view ZI_SalesOrders as
  select from vbak as header
    association [0..*] to vbap as item
      on header.vbeln = item.vbeln
{
  key header.vbeln,
  header.kunnr,
  header.netwr,
  header.waerk,
  count( item.posnr ) as ItemCount
}
group by
  header.vbeln,
  header.kunnr,
  header.netwr,
  header.waerk
```

## CDS Table Functions – When You Need AMDP

Switch to table functions when you need:

- Complex string manipulation
- Window functions (ROW_NUMBER, RANK, LAG)
- Recursive logic
- Database-specific functions not exposed in CDS
- Performance-critical calculations that benefit from SQLScript

```abap
@AbapCatalog.sqlViewName: 'ZTF_SALES_RANK'
define table function ZI_SalesRanking
  with parameters
    @Environment.systemField: #CLIENT
    p_clnt : abap.clnt
returns
{
  client     : abap.clnt;
  vbeln      : vbeln_va;
  kunnr      : kunnr;
  netwr      : netwr_ak;
  sales_rank : abap.int4;
}
implemented by method
  zcl_amdp_sales=>get_ranked_sales;
```

```abap
CLASS zcl_amdp_sales DEFINITION PUBLIC FINAL.
  PUBLIC SECTION.
    INTERFACES if_amdp_marker_hdb.

    CLASS-METHODS get_ranked_sales
      FOR TABLE FUNCTION ZI_SalesRanking.
ENDCLASS.

CLASS zcl_amdp_sales IMPLEMENTATION.
  METHOD get_ranked_sales BY DATABASE FUNCTION
    FOR HDB LANGUAGE SQLSCRIPT
    OPTIONS READ-ONLY.

    RETURN
      SELECT
        mandt AS client,
        vbeln,
        kunnr,
        netwr,
        RANK() OVER (
          PARTITION BY kunnr
          ORDER BY netwr DESC
        ) AS sales_rank
      FROM vbak
      WHERE mandt = p_clnt;

  ENDMETHOD.
ENDCLASS.
```

## Performance Comparison

In a recent S/4HANA upgrade project, we migrated a classical ABAP report that processed 2M records:

| Approach | Execution Time |
|----------|---------------|
| Classical SELECT + LOOP | 45 seconds |
| Pure CDS View | 12 seconds |
| CDS + AMDP (SQLScript) | 3 seconds |

The AMDP approach won because it pushed the ranking calculation entirely to the HANA database, eliminating data transfer overhead.

## Rules of Thumb

1. **Start with pure CDS** – if it works, stay there
2. **Move to AMDP only when** CDS expressions can't express the logic
3. **Profile before optimizing** – don't assume AMDP is always faster
4. **Keep AMDP methods focused** – single responsibility, testable
5. **Document the why** – future maintainers need to know why AMDP was chosen
