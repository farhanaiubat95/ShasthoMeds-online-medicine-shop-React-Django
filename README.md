# ShasthoMeds-online-medicine-shop-React-Django

 -> The full ShasthoMeds process 
1. User Registration/Login
   -New users sign up with email and get an OTP to verify.
   -After OTP verification, account is created.
   -Existing users can log in directly.

2. Browse Medicines
  -Users can view and search all available medicines.
  -Each medicine shows if it needs a prescription or not.

3. Add to Cart
   -If medicine doesn't require prescription → can be added to cart directly.
   -If medicine requires prescription → user must upload valid prescription.
   -Admin checks the prescription and approves or rejects it.
   -Once approved, user can add the medicine to cart.

4. Place Order
   -User reviews cart and places the order.
   -A confirmation page shows order details.

5. Admin Review
   -Admin checks and approves the entire order.
   -Confirms availability and validity.

6. Order Confirmation
   -User gets a confirmation email with product and payment details.

7. Delivery Process
   -Admin processes the order and marks it as shipped/delivered (future step).
