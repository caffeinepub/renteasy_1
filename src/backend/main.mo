import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

(actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile System
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Rental System
  type Rental = {
    title : Text;
    category : Text;
    description : Text;
    price : ?Nat;
    location : Text;
    phone : Text;
    image : Storage.ExternalBlob;
    createdBy : Principal;
    createdAt : Time.Time;
  };

  module Rental {
    public func compareByCreatedAtDescending(rental1 : Rental, rental2 : Rental) : Order.Order {
      if (rental1.createdAt > rental2.createdAt) {
        #less;
      } else if (rental1.createdAt < rental2.createdAt) {
        #greater;
      } else {
        Text.compare(rental1.title, rental2.title);
      };
    };
  };

  let rentals = Map.empty<Text, Rental>();

  public shared ({ caller }) func createRental(
    title : Text,
    category : Text,
    description : Text,
    price : ?Nat,
    location : Text,
    phone : Text,
    image : Storage.ExternalBlob,
  ) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create rentals");
    };

    let rental : Rental = {
      title;
      category;
      description;
      price;
      location;
      phone;
      image;
      createdBy = caller;
      createdAt = Time.now();
    };

    rentals.add(title, rental);
    title;
  };

  public query ({ caller }) func getRental(title : Text) : async Rental {
    switch (rentals.get(title)) {
      case (null) {
        Runtime.trap("Rental not found");
      };
      case (?rental) {
        rental;
      };
    };
  };

  public query (_) func getRentals(page : Nat, pageSize : Nat) : async [Rental] {
    let list = List.empty<Rental>();
    for (rental in rentals.values()) {
      list.add(rental);
    };

    let sortedRentals = list.toArray().sort(
      Rental.compareByCreatedAtDescending
    );

    let start = page * pageSize;
    if (start >= sortedRentals.size()) {
      return [];
    };

    let end = Nat.min(start + pageSize, sortedRentals.size());
    sortedRentals.sliceToArray(start, end);
  };

  public query (_) func searchRentals(searchTerm : Text) : async (Int, [Rental]) {
    let filtered = List.empty<Rental>();

    for (rental in rentals.values()) {
      if (
        rental.title.contains(#text searchTerm) or
        rental.category.contains(#text searchTerm) or
        rental.location.contains(#text searchTerm)
      ) {
        filtered.add(rental);
      };
    };

    let sortedRentals = filtered.toArray().sort(
      Rental.compareByCreatedAtDescending
    );

    let totalCount = sortedRentals.size();

    (totalCount.toInt(), sortedRentals);
  };

  public shared ({ caller }) func updateRental(
    title : Text,
    category : Text,
    description : Text,
    price : ?Nat,
    location : Text,
    phone : Text,
    image : Storage.ExternalBlob,
  ) : async Rental {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can update rentals");
    };

    switch (rentals.get(title)) {
      case (null) {
        Runtime.trap("Rental not found");
      };
      case (?existing) {
        if (existing.createdBy != caller) {
          Runtime.trap("Unauthorized: Only the owner can update this rental");
        };

        let updatedRental : Rental = {
          title;
          category;
          description;
          price;
          location;
          phone;
          image;
          createdBy = caller;
          createdAt = existing.createdAt;
        };

        rentals.add(title, updatedRental);
        updatedRental;
      };
    };
  };

  public shared ({ caller }) func deleteRental(title : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can delete rentals");
    };

    switch (rentals.get(title)) {
      case (null) {
        Runtime.trap("Rental not found");
      };
      case (?rental) {
        if (rental.createdBy != caller) {
          Runtime.trap("Unauthorized: Only the owner can delete this rental");
        };
        rentals.remove(title);
      };
    };
  };

  // Order System
  type OrderRecord = {
    rental : Text; // Rental title reference
    buyer : Principal;
    buyerPhone : Text;
    buyerEmail : Text;
    buyerAddress : Text;
    status : Text;
    createdAt : Time.Time;
  };

  // Stable unique order ID counter
  stable var nextOrderId : Nat = 1;
  let orders = Map.empty<Nat, OrderRecord>();

  // Create Order - Only authenticated users
  public shared ({ caller }) func createOrder(
    rentalTitle : Text,
    buyerPhone : Text,
    buyerEmail : Text,
    buyerAddress : Text,
  ) : async Nat {
    // Authorization: Only authenticated users can create orders
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create orders");
    };

    // Verify rental exists
    switch (rentals.get(rentalTitle)) {
      case (null) {
        Runtime.trap("Rental not found");
      };
      case (?rental) {
        // Create new order with unique ID
        let orderId = nextOrderId;
        nextOrderId += 1;

        let order : OrderRecord = {
          rental = rentalTitle;
          buyer = caller;
          buyerPhone;
          buyerEmail;
          buyerAddress;
          status = "Pending";
          createdAt = Time.now();
        };

        orders.add(orderId, order);
        orderId;
      };
    };
  };

  // Get single order - Authorization: buyer or rental owner only
  public query ({ caller }) func getOrder(orderId : Nat) : async OrderRecord {
    switch (orders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        // Check if caller is buyer
        if (order.buyer == caller) {
          return order;
        };

        // Check if caller is rental owner
        switch (rentals.get(order.rental)) {
          case (null) {
            Runtime.trap("Associated rental not found");
          };
          case (?rental) {
            if (rental.createdBy == caller) {
              return order;
            };
          };
        };

        // Not authorized
        Runtime.trap("Unauthorized: Can only view orders you created or received");
      };
    };
  };

  // List orders for owner (Owner Messages page)
  // Authorization: Returns only orders for rentals owned by caller
  public query ({ caller }) func getOwnerOrders() : async [(Nat, OrderRecord, Text, Principal, Text, Text, Text)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view owner orders");
    };

    let result = List.empty<(Nat, OrderRecord, Text, Principal, Text, Text, Text)>();

    for ((orderId, order) in orders.entries()) {
      switch (rentals.get(order.rental)) {
        case (null) {
          // Skip if rental not found
        };
        case (?rental) {
          // Only include if caller is the rental owner
          if (rental.createdBy == caller) {
            result.add((
              orderId,
              order,
              rental.title,
              order.buyer,
              order.buyerPhone,
              order.buyerEmail,
              order.buyerAddress,
            ));
          };
        };
      };
    };

    result.toArray();
  };

  // List orders for buyer (My Orders page)
  // Authorization: Returns only orders where buyer == caller
  public query ({ caller }) func getBuyerOrders() : async [(Nat, OrderRecord, Storage.ExternalBlob, Text, ?Nat)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view buyer orders");
    };

    let result = List.empty<(Nat, OrderRecord, Storage.ExternalBlob, Text, ?Nat)>();

    for ((orderId, order) in orders.entries()) {
      // Only include if caller is the buyer
      if (order.buyer == caller) {
        switch (rentals.get(order.rental)) {
          case (null) {
            // Skip if rental not found
          };
          case (?rental) {
            result.add((
              orderId,
              order,
              rental.image,
              rental.title,
              rental.price,
            ));
          };
        };
      };
    };

    result.toArray();
  };

  // Accept Order - Authorization: Only rental owner can accept
  public shared ({ caller }) func acceptOrder(orderId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can accept orders");
    };

    switch (orders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        // Verify caller is the rental owner
        switch (rentals.get(order.rental)) {
          case (null) {
            Runtime.trap("Associated rental not found");
          };
          case (?rental) {
            if (rental.createdBy != caller) {
              Runtime.trap("Unauthorized: Only the rental owner can accept this order");
            };

            // Update existing order status (no new record created)
            let updatedOrder : OrderRecord = {
              rental = order.rental;
              buyer = order.buyer;
              buyerPhone = order.buyerPhone;
              buyerEmail = order.buyerEmail;
              buyerAddress = order.buyerAddress;
              status = "Accepted";
              createdAt = order.createdAt;
            };

            orders.add(orderId, updatedOrder);
          };
        };
      };
    };
  };

  // Delete Order - Authorization: Only rental owner can delete
  public shared ({ caller }) func deleteOrder(orderId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can delete orders");
    };

    switch (orders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        // Verify caller is the rental owner
        switch (rentals.get(order.rental)) {
          case (null) {
            Runtime.trap("Associated rental not found");
          };
          case (?rental) {
            if (rental.createdBy != caller) {
              Runtime.trap("Unauthorized: Only the rental owner can delete this order");
            };

            orders.remove(orderId);
          };
        };
      };
    };
  };

  /*
  END-TO-END VERIFICATION TEST INSTRUCTIONS:
  
  Test with two Internet Identity accounts (Buyer and Owner):
  
  1. Owner Account:
     - Create a rental listing (e.g., "Beach House")
     - Note the rental details
  
  2. Buyer Account:
     - Browse rentals and find "Beach House"
     - Click "Buy" and fill in contact details
     - Submit order (creates ONE order with status "Pending")
     - Navigate to "My Orders" page
     - Verify: ONE order appears with status "Pending"
  
  3. Owner Account:
     - Navigate to "Owner Messages" page
     - Verify: ONE order appears for "Beach House"
     - Click "Accept" on the order
     - Verify: Status changes to "Accepted"
  
  4. Buyer Account:
     - Refresh or navigate to "My Orders" page
     - Verify: The SAME order now shows status "Accepted"
     - Verify: NO duplicate orders exist
  
  5. Authorization Tests:
     - Buyer cannot accept their own order (should fail)
     - Buyer cannot delete the order (should fail)
     - Owner cannot view orders for other owners' rentals
     - Unauthenticated users cannot create orders
  
  Expected Result: Exactly ONE order record throughout the entire flow,
  with status transitioning from "Pending" to "Accepted".
  */
});
