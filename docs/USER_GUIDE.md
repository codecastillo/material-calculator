# User Guide

## Material Pricing Tab

This is where you set up your suppliers and material prices.

### Adding a Supplier

1. Click **Add Supplier**
2. Enter the supplier name, phone, and any notes
3. Click **Save**

You can add as many suppliers as you work with. Each supplier has their own price list.

### Managing Materials

Materials are organized by phase category (Lath, Gray Coat, Color Coat, Stone, Drywall, Painting).

1. Pick a category from the dropdown
2. Click **Add Material**
3. Fill in the name, unit (sheet, bag, roll, etc.), coverage per unit, and coverage unit (sqft or sqyd)
4. Enter the price for each supplier
5. Click **Save**

To edit a material, click on it in the list. To reorder, drag and drop. To duplicate, click the copy icon -- handy when adding a similar material with different sizing.

### Importing Prices from CSV

If your supplier sends you a price sheet:

1. Select the supplier from the dropdown
2. Click **Import CSV**
3. Upload the file -- it should have columns for `material_name` and `price`
4. Review the preview and confirm

The import matches materials by name. Anything it can't match gets flagged so you can fix it.

### Exporting

Click **Export CSV** to download your current price list as a spreadsheet. Useful for sharing with your crew or keeping a backup.

---

## Job Calculator

This is where you estimate a job.

### Creating an Estimate

1. Click **New Job**
2. Enter the job name and total square footage
3. Check which phases apply (Lath, Gray Coat, Color Coat, Stone, Drywall, Painting)
4. Pick a supplier to price against
5. Set your profit margin percentage
6. The calculator shows material quantities, costs, and your total with markup

### How Quantities Are Calculated

Each material has a **coverage per unit** value. For example, if a sheet of lath covers 2.5 square yards, the calculator divides your total area by 2.5 and rounds up. It handles the sqft-to-sqyd conversion automatically.

### Comparing Suppliers

To see how pricing stacks up across vendors, switch the supplier dropdown and watch the totals update. This tells you exactly how much you save (or spend) by going with one supplier over another.

---

## Order Forms

Once you have an estimate, you can generate order forms to hand to your supplier.

1. Open a saved job or finish a new calculation
2. Click **Generate Order Form**
3. Filter by phase if you're ordering in stages (e.g., just Lath materials first)
4. Click **Print** to get a clean printable sheet with quantities, units, and the supplier name

The order form leaves off your pricing and margin -- it just shows what to order and how much.

---

## Saving and Loading Jobs

### Saving

Click **Save Job** after building an estimate. Give it a name you'll recognize later (e.g., "Smith Residence - March 2026").

### Loading

Go to the **Saved Jobs** list, click on any job to reload it. All the phases, square footage, supplier, and margin settings come back exactly as you left them.

### Deleting

Swipe or click the delete icon next to a saved job to remove it.

---

## Tips

- **Coverage ratios matter.** Double-check coverage values against what's printed on the product. A wrong coverage number throws off the entire estimate.
- **Linear vs. area materials.** Some items like weep screed are measured in linear feet, not square feet. Make sure the coverage unit is set correctly for these.
- **Add waste factor.** Most contractors figure 5-10% waste. You can bump your square footage up by that amount, or adjust coverage values to account for it.
- **Supplier comparison before ordering.** Always check at least two suppliers before placing an order. Even small per-unit differences add up fast on a big job.
- **Keep prices current.** Material prices change. Update your price lists whenever you get new quotes. The CSV import makes this fast.
- **Use margin, not markup.** The calculator uses margin (percentage of selling price), not markup (percentage of cost). A 20% margin means you keep 20 cents of every dollar.
