import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
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

  // ─── Rental ───────────────────────────────────────────────────────────────

  type RentalLegacy = {
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
    latitude : ?Float;
    longitude : ?Float;
  };

  module Rental {
    public func compareByCreatedAtDescending(r1 : Rental, r2 : Rental) : Order.Order {
      if (r1.createdAt > r2.createdAt) { #less }
      else if (r1.createdAt < r2.createdAt) { #greater }
      else { Text.compare(r1.title, r2.title) };
    };
  };

  let rentals = Map.empty<Text, RentalLegacy>();
  let rentalsV2 = Map.empty<Text, Rental>();
  stable var rentalsMigrated : Bool = false;

  // ─── Order ────────────────────────────────────────────────────────────────

  type OrderRecordLegacy = {
    rental : Text;
    buyer : Principal;
    buyerPhone : Text;
    buyerEmail : Text;
    buyerAddress : Text;
    status : Text;
    createdAt : Time.Time;
  };

  type OrderRecordV2 = {
    rental : Text;
    buyer : Principal;
    buyerPhone : Text;
    buyerEmail : Text;
    buyerAddress : Text;
    buyerName : Text;
    status : Text;
    createdAt : Time.Time;
    duration : Text;
    totalPrice : Nat;
  };

  type OrderRecord = {
    rental : Text;
    buyer : Principal;
    buyerPhone : Text;
    buyerEmail : Text;
    buyerAddress : Text;
    buyerName : Text;
    status : Text;
    createdAt : Time.Time;
    duration : Text;
    totalPrice : Nat;
    startDate : Time.Time;
    endDate : Time.Time;
  };

  stable var nextOrderId : Nat = 1;
  let orders = Map.empty<Nat, OrderRecordLegacy>();
  let ordersV2 = Map.empty<Nat, OrderRecordV2>();
  let ordersV3 = Map.empty<Nat, OrderRecord>();
  stable var ordersMigrated : Bool = false;
  stable var ordersV3Migrated : Bool = false;

  // ─── Notifications ────────────────────────────────────────────────────────

  type Notification = {
    user : Principal;
    message : Text;
    relatedOrder : Nat;
    isRead : Bool;
    createdAt : Time.Time;
  };

  stable var nextNotificationId : Nat = 1;
  let notifications = Map.empty<Nat, Notification>();

  // ─── Reviews ──────────────────────────────────────────────────────────────

  type Review = {
    rental : Text;
    reviewer : Principal;
    rating : Nat;
    reviewText : Text;
    createdAt : Time.Time;
  };

  stable var nextReviewId : Nat = 1;
  let reviews = Map.empty<Nat, Review>();

  // ─── Favorites ────────────────────────────────────────────────────────────

  type Favorite = {
    user : Principal;
    rental : Text;
    createdAt : Time.Time;
  };

  stable var nextFavoriteId : Nat = 1;
  let favorites = Map.empty<Nat, Favorite>();

  // ─── SearchHistory ────────────────────────────────────────────────────────

  type SearchHistory = {
    user : Principal;
    searchText : Text;
    createdAt : Time.Time;
  };

  stable var nextSearchHistoryId : Nat = 1;
  let searchHistories = Map.empty<Nat, SearchHistory>();

  // ─── Report ───────────────────────────────────────────────────────────────

  type Report = {
    reporter : Principal;
    reportedUser : Principal;
    rental : Text;
    reason : Text;
    createdAt : Time.Time;
  };

  stable var nextReportId : Nat = 1;
  let reportRecords = Map.empty<Nat, Report>();

  // ─── Block ────────────────────────────────────────────────────────────────

  type Block = {
    user : Principal;
    blockedUser : Principal;
  };

  stable var nextBlockId : Nat = 1;
  let blockRecords = Map.empty<Nat, Block>();

  // ─── Negotiation ──────────────────────────────────────────────────────────

  type Negotiation = {
    rental : Text;
    buyer : Principal;
    offerPrice : Nat;
    message : Text;
    status : Text;
    createdAt : Time.Time;
  };

  stable var nextNegotiationId : Nat = 1;
  let negotiations = Map.empty<Nat, Negotiation>();

  // ─── Cart ─────────────────────────────────────────────────────────────────

  type Cart = {
    user : Principal;
    rental : Text;
    createdAt : Time.Time;
  };

  stable var nextCartId : Nat = 1;
  let carts = Map.empty<Nat, Cart>();


  // ─── Migration ────────────────────────────────────────────────────────────

  system func postupgrade() {
    if (not rentalsMigrated) {
      for ((title, r) in rentals.entries()) {
        if (rentalsV2.get(title) == null) {
          rentalsV2.add(title, {
            title = r.title; category = r.category; description = r.description;
            price = r.price; location = r.location; phone = r.phone;
            image = r.image; createdBy = r.createdBy; createdAt = r.createdAt;
            latitude = null; longitude = null;
          });
        };
      };
      rentalsMigrated := true;
    };

    if (not ordersMigrated) {
      for ((id, o) in orders.entries()) {
        if (ordersV2.get(id) == null) {
          ordersV2.add(id, {
            rental = o.rental; buyer = o.buyer; buyerPhone = o.buyerPhone;
            buyerEmail = o.buyerEmail; buyerAddress = o.buyerAddress; buyerName = "";
            status = o.status; createdAt = o.createdAt; duration = "1 Month"; totalPrice = 0;
          });
        };
      };
      ordersMigrated := true;
    };

    if (not ordersV3Migrated) {
      for ((id, o) in ordersV2.entries()) {
        if (ordersV3.get(id) == null) {
          ordersV3.add(id, {
            rental = o.rental; buyer = o.buyer; buyerPhone = o.buyerPhone;
            buyerEmail = o.buyerEmail; buyerAddress = o.buyerAddress; buyerName = o.buyerName;
            status = o.status; createdAt = o.createdAt; duration = o.duration;
            totalPrice = o.totalPrice; startDate = 0; endDate = 0;
          });
        };
      };
      ordersV3Migrated := true;
    };
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  func getRentalByTitle(title : Text) : ?Rental {
    switch (rentalsV2.get(title)) {
      case (?r) { ?r };
      case (null) {
        switch (rentals.get(title)) {
          case (null) { null };
          case (?r) {
            ?{ title = r.title; category = r.category; description = r.description;
               price = r.price; location = r.location; phone = r.phone;
               image = r.image; createdBy = r.createdBy; createdAt = r.createdAt;
               latitude = null; longitude = null };
          };
        };
      };
    };
  };

  func getOrderById(id : Nat) : ?OrderRecord {
    switch (ordersV3.get(id)) {
      case (?o) { ?o };
      case (null) {
        switch (ordersV2.get(id)) {
          case (?o) {
            ?{ rental = o.rental; buyer = o.buyer; buyerPhone = o.buyerPhone;
               buyerEmail = o.buyerEmail; buyerAddress = o.buyerAddress; buyerName = o.buyerName;
               status = o.status; createdAt = o.createdAt; duration = o.duration;
               totalPrice = o.totalPrice; startDate = 0; endDate = 0 };
          };
          case (null) {
            switch (orders.get(id)) {
              case (null) { null };
              case (?o) {
                ?{ rental = o.rental; buyer = o.buyer; buyerPhone = o.buyerPhone;
                   buyerEmail = o.buyerEmail; buyerAddress = o.buyerAddress; buyerName = "";
                   status = o.status; createdAt = o.createdAt; duration = "1 Month";
                   totalPrice = 0; startDate = 0; endDate = 0 };
              };
            };
          };
        };
      };
    };
  };

  // ─── Rental API ───────────────────────────────────────────────────────────

  public shared ({ caller }) func createRental(
    title : Text, category : Text, description : Text, price : ?Nat,
    location : Text, phone : Text, image : Storage.ExternalBlob,
    latitude : ?Float, longitude : ?Float,
  ) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create rentals");
    };
    rentalsV2.add(title, {
      title; category; description; price; location; phone; image;
      createdBy = caller; createdAt = Time.now(); latitude; longitude;
    });
    title;
  };

  public query (_) func getRental(title : Text) : async Rental {
    switch (getRentalByTitle(title)) {
      case (null) { Runtime.trap("Rental not found") };
      case (?r) { r };
    };
  };

  public query (_) func getRentals(page : Nat, pageSize : Nat) : async [Rental] {
    let list = List.empty<Rental>();
    for ((_, r) in rentalsV2.entries()) { list.add(r) };
    for ((title, r) in rentals.entries()) {
      if (rentalsV2.get(title) == null) {
        list.add({ title = r.title; category = r.category; description = r.description;
                   price = r.price; location = r.location; phone = r.phone;
                   image = r.image; createdBy = r.createdBy; createdAt = r.createdAt;
                   latitude = null; longitude = null });
      };
    };
    let sorted = list.toArray().sort(Rental.compareByCreatedAtDescending);
    let start = page * pageSize;
    if (start >= sorted.size()) { return [] };
    sorted.sliceToArray(start, Nat.min(start + pageSize, sorted.size()));
  };

  public query (_) func searchRentals(searchTerm : Text) : async (Int, [Rental]) {
    let filtered = List.empty<Rental>();
    let seen = Map.empty<Text, Bool>();

    for ((_, r) in rentalsV2.entries()) {
      if (r.title.contains(#text searchTerm) or r.category.contains(#text searchTerm) or r.location.contains(#text searchTerm)) {
        filtered.add(r); seen.add(r.title, true);
      };
    };
    for ((title, r) in rentals.entries()) {
      if (seen.get(title) == null) {
        let rental : Rental = { title = r.title; category = r.category; description = r.description;
          price = r.price; location = r.location; phone = r.phone; image = r.image;
          createdBy = r.createdBy; createdAt = r.createdAt; latitude = null; longitude = null };
        if (rental.title.contains(#text searchTerm) or rental.category.contains(#text searchTerm) or rental.location.contains(#text searchTerm)) {
          filtered.add(rental);
        };
      };
    };

    let sorted = filtered.toArray().sort(Rental.compareByCreatedAtDescending);
    (sorted.size().toInt(), sorted);
  };

  public shared ({ caller }) func updateRental(
    title : Text, category : Text, description : Text, price : ?Nat,
    location : Text, phone : Text, image : Storage.ExternalBlob,
  ) : async Rental {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can update rentals");
    };
    switch (getRentalByTitle(title)) {
      case (null) { Runtime.trap("Rental not found") };
      case (?existing) {
        if (existing.createdBy != caller) {
          Runtime.trap("Unauthorized: Only the owner can update this rental");
        };
        let updated : Rental = { title; category; description; price; location; phone; image;
          createdBy = caller; createdAt = existing.createdAt;
          latitude = existing.latitude; longitude = existing.longitude };
        rentalsV2.add(title, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteRental(title : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can delete rentals");
    };
    switch (getRentalByTitle(title)) {
      case (null) { Runtime.trap("Rental not found") };
      case (?rental) {
        if (rental.createdBy != caller) {
          Runtime.trap("Unauthorized: Only the owner can delete this rental");
        };
        rentalsV2.remove(title);
        rentals.remove(title);
      };
    };
  };

  public query ({ caller }) func getMyRentals() : async [Rental] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let result = List.empty<Rental>();
    let seen = Map.empty<Text, Bool>();
    for ((_, r) in rentalsV2.entries()) {
      if (r.createdBy == caller) { result.add(r); seen.add(r.title, true) };
    };
    for ((title, r) in rentals.entries()) {
      if (seen.get(title) == null and r.createdBy == caller) {
        result.add({ title = r.title; category = r.category; description = r.description;
          price = r.price; location = r.location; phone = r.phone; image = r.image;
          createdBy = r.createdBy; createdAt = r.createdAt; latitude = null; longitude = null });
      };
    };
    result.toArray().sort(Rental.compareByCreatedAtDescending);
  };

  public query ({ caller }) func getOwnerProfileOrders() : async [(Nat, OrderRecord, Rental)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let result = List.empty<(Nat, OrderRecord, Rental)>();
    let seen = Map.empty<Nat, Bool>();

    for ((id, order) in ordersV3.entries()) {
      switch (getRentalByTitle(order.rental)) {
        case (null) {};
        case (?rental) {
          if (rental.createdBy == caller) {
            result.add((id, order, rental));
            seen.add(id, true);
          };
        };
      };
    };
    for ((id, o) in ordersV2.entries()) {
      if (seen.get(id) == null) {
        switch (getRentalByTitle(o.rental)) {
          case (null) {};
          case (?rental) {
            if (rental.createdBy == caller) {
              let order : OrderRecord = { rental = o.rental; buyer = o.buyer; buyerPhone = o.buyerPhone;
                buyerEmail = o.buyerEmail; buyerAddress = o.buyerAddress; buyerName = o.buyerName;
                status = o.status; createdAt = o.createdAt; duration = o.duration;
                totalPrice = o.totalPrice; startDate = 0; endDate = 0 };
              result.add((id, order, rental));
              seen.add(id, true);
            };
          };
        };
      };
    };
    result.toArray();
  };

  // ─── Notification API ─────────────────────────────────────────────────────

  public query ({ caller }) func getMyNotifications() : async [(Nat, Notification)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let result = List.empty<(Nat, Notification)>();
    for ((id, n) in notifications.entries()) {
      if (n.user == caller) { result.add((id, n)) };
    };
    result.toArray().sort(func(a, b) {
      if (a.1.createdAt > b.1.createdAt) { #less }
      else if (a.1.createdAt < b.1.createdAt) { #greater }
      else { #equal }
    });
  };

  public query ({ caller }) func getUnreadNotificationCount() : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { return 0 };
    var count = 0;
    for ((_, n) in notifications.entries()) {
      if (n.user == caller and not n.isRead) { count += 1 };
    };
    count;
  };

  public shared ({ caller }) func markNotificationRead(notifId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    switch (notifications.get(notifId)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?n) {
        if (n.user != caller) { Runtime.trap("Unauthorized") };
        notifications.add(notifId, { user = n.user; message = n.message;
          relatedOrder = n.relatedOrder; isRead = true; createdAt = n.createdAt });
      };
    };
  };

  // ─── Order API ────────────────────────────────────────────────────────────

  public shared ({ caller }) func createOrder(
    rentalTitle : Text, buyerPhone : Text, buyerEmail : Text,
    buyerAddress : Text, buyerName : Text, duration : Text, totalPrice : Nat,
    startDate : Time.Time, endDate : Time.Time,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create orders");
    };
    switch (getRentalByTitle(rentalTitle)) {
      case (null) { Runtime.trap("Rental not found") };
      case (?rental) {
        let orderId = nextOrderId;
        nextOrderId += 1;
        ordersV3.add(orderId, {
          rental = rentalTitle; buyer = caller; buyerPhone; buyerEmail;
          buyerAddress; buyerName; status = "Pending"; createdAt = Time.now();
          duration; totalPrice; startDate; endDate;
        });
        let notifId = nextNotificationId;
        nextNotificationId += 1;
        notifications.add(notifId, {
          user = rental.createdBy;
          message = "New order request for " # rental.title;
          relatedOrder = orderId; isRead = false; createdAt = Time.now();
        });
        orderId;
      };
    };
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async OrderRecord {
    switch (getOrderById(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.buyer == caller) { return order };
        switch (getRentalByTitle(order.rental)) {
          case (null) { Runtime.trap("Associated rental not found") };
          case (?rental) {
            if (rental.createdBy == caller) { return order };
          };
        };
        Runtime.trap("Unauthorized: Can only view orders you created or received");
      };
    };
  };

  public query ({ caller }) func getOwnerOrders() : async [(Nat, OrderRecord, Text, Principal, Text, Text, Text)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let result = List.empty<(Nat, OrderRecord, Text, Principal, Text, Text, Text)>();
    let seen = Map.empty<Nat, Bool>();

    for ((id, order) in ordersV3.entries()) {
      switch (getRentalByTitle(order.rental)) {
        case (null) {};
        case (?rental) {
          if (rental.createdBy == caller) {
            result.add((id, order, rental.title, order.buyer, order.buyerPhone, order.buyerEmail, order.buyerAddress));
            seen.add(id, true);
          };
        };
      };
    };
    for ((id, o) in ordersV2.entries()) {
      if (seen.get(id) == null) {
        switch (getRentalByTitle(o.rental)) {
          case (null) {};
          case (?rental) {
            if (rental.createdBy == caller) {
              let order : OrderRecord = { rental = o.rental; buyer = o.buyer; buyerPhone = o.buyerPhone;
                buyerEmail = o.buyerEmail; buyerAddress = o.buyerAddress; buyerName = o.buyerName;
                status = o.status; createdAt = o.createdAt; duration = o.duration;
                totalPrice = o.totalPrice; startDate = 0; endDate = 0 };
              result.add((id, order, rental.title, o.buyer, o.buyerPhone, o.buyerEmail, o.buyerAddress));
              seen.add(id, true);
            };
          };
        };
      };
    };
    for ((id, o) in orders.entries()) {
      if (seen.get(id) == null) {
        switch (getRentalByTitle(o.rental)) {
          case (null) {};
          case (?rental) {
            if (rental.createdBy == caller) {
              let order : OrderRecord = { rental = o.rental; buyer = o.buyer; buyerPhone = o.buyerPhone;
                buyerEmail = o.buyerEmail; buyerAddress = o.buyerAddress; buyerName = "";
                status = o.status; createdAt = o.createdAt; duration = "1 Month";
                totalPrice = 0; startDate = 0; endDate = 0 };
              result.add((id, order, rental.title, o.buyer, o.buyerPhone, o.buyerEmail, o.buyerAddress));
            };
          };
        };
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getBuyerOrders() : async [(Nat, OrderRecord, Storage.ExternalBlob, Text, ?Nat)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let result = List.empty<(Nat, OrderRecord, Storage.ExternalBlob, Text, ?Nat)>();
    let seen = Map.empty<Nat, Bool>();

    for ((id, order) in ordersV3.entries()) {
      if (order.buyer == caller) {
        switch (getRentalByTitle(order.rental)) {
          case (null) {};
          case (?rental) {
            result.add((id, order, rental.image, rental.title, rental.price));
            seen.add(id, true);
          };
        };
      };
    };
    for ((id, o) in ordersV2.entries()) {
      if (o.buyer == caller and seen.get(id) == null) {
        switch (getRentalByTitle(o.rental)) {
          case (null) {};
          case (?rental) {
            let order : OrderRecord = { rental = o.rental; buyer = o.buyer; buyerPhone = o.buyerPhone;
              buyerEmail = o.buyerEmail; buyerAddress = o.buyerAddress; buyerName = o.buyerName;
              status = o.status; createdAt = o.createdAt; duration = o.duration;
              totalPrice = o.totalPrice; startDate = 0; endDate = 0 };
            result.add((id, order, rental.image, rental.title, rental.price));
            seen.add(id, true);
          };
        };
      };
    };
    for ((id, o) in orders.entries()) {
      if (o.buyer == caller and seen.get(id) == null) {
        switch (getRentalByTitle(o.rental)) {
          case (null) {};
          case (?rental) {
            let order : OrderRecord = { rental = o.rental; buyer = o.buyer; buyerPhone = o.buyerPhone;
              buyerEmail = o.buyerEmail; buyerAddress = o.buyerAddress; buyerName = "";
              status = o.status; createdAt = o.createdAt; duration = "1 Month";
              totalPrice = 0; startDate = 0; endDate = 0 };
            result.add((id, order, rental.image, rental.title, rental.price));
          };
        };
      };
    };
    result.toArray();
  };

  public shared ({ caller }) func acceptOrder(orderId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    switch (getOrderById(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        switch (getRentalByTitle(order.rental)) {
          case (null) { Runtime.trap("Associated rental not found") };
          case (?rental) {
            if (rental.createdBy != caller) {
              Runtime.trap("Unauthorized: Only the rental owner can accept this order");
            };
            ordersV3.add(orderId, { rental = order.rental; buyer = order.buyer;
              buyerPhone = order.buyerPhone; buyerEmail = order.buyerEmail;
              buyerAddress = order.buyerAddress; buyerName = order.buyerName;
              status = "Accepted"; createdAt = order.createdAt;
              duration = order.duration; totalPrice = order.totalPrice;
              startDate = order.startDate; endDate = order.endDate });
            ordersV2.remove(orderId);
            orders.remove(orderId);
            let notifId = nextNotificationId;
            nextNotificationId += 1;
            notifications.add(notifId, {
              user = order.buyer;
              message = "Your order for " # rental.title # " has been accepted";
              relatedOrder = orderId; isRead = false; createdAt = Time.now();
            });
          };
        };
      };
    };
  };

  public shared ({ caller }) func completeOrder(orderId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    switch (getOrderById(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.buyer != caller) {
          Runtime.trap("Unauthorized: Only the buyer can mark order as completed");
        };
        if (order.status != "Accepted") {
          Runtime.trap("Order must be Accepted before it can be marked as Completed");
        };
        ordersV3.add(orderId, { rental = order.rental; buyer = order.buyer;
          buyerPhone = order.buyerPhone; buyerEmail = order.buyerEmail;
          buyerAddress = order.buyerAddress; buyerName = order.buyerName;
          status = "Completed"; createdAt = order.createdAt;
          duration = order.duration; totalPrice = order.totalPrice;
          startDate = order.startDate; endDate = order.endDate });
        ordersV2.remove(orderId);
        orders.remove(orderId);
      };
    };
  };

  public shared ({ caller }) func deleteOrder(orderId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    switch (getOrderById(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        switch (getRentalByTitle(order.rental)) {
          case (null) { Runtime.trap("Associated rental not found") };
          case (?rental) {
            if (rental.createdBy != caller) {
              Runtime.trap("Unauthorized: Only the rental owner can delete this order");
            };
            ordersV3.remove(orderId);
            ordersV2.remove(orderId);
            orders.remove(orderId);
          };
        };
      };
    };
  };

  // ─── Review API ───────────────────────────────────────────────────────────

  public shared ({ caller }) func createReview(
    rentalTitle : Text, rating : Nat, reviewText : Text,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    if (rating < 1 or rating > 5) { Runtime.trap("Rating must be between 1 and 5") };
    for ((_, r) in reviews.entries()) {
      if (r.rental == rentalTitle and r.reviewer == caller) {
        Runtime.trap("You have already reviewed this rental");
      };
    };
    let id = nextReviewId;
    nextReviewId += 1;
    reviews.add(id, { rental = rentalTitle; reviewer = caller; rating; reviewText; createdAt = Time.now() });
    id;
  };

  public query (_) func getReviewsForRental(rentalTitle : Text) : async [(Nat, Review, Text)] {
    let result = List.empty<(Nat, Review, Text)>();
    for ((id, r) in reviews.entries()) {
      if (r.rental == rentalTitle) {
        let name = switch (userProfiles.get(r.reviewer)) {
          case (null) { "Anonymous" };
          case (?p) { p.name };
        };
        result.add((id, r, name));
      };
    };
    result.toArray();
  };

  public query ({ caller }) func hasUserReviewedRental(rentalTitle : Text) : async Bool {
    for ((_, r) in reviews.entries()) {
      if (r.rental == rentalTitle and r.reviewer == caller) { return true };
    };
    false;
  };

  // ─── Favorites API ────────────────────────────────────────────────────────

  public shared ({ caller }) func addFavorite(rentalTitle : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    switch (getRentalByTitle(rentalTitle)) {
      case (null) { Runtime.trap("Rental not found") };
      case (?_) {};
    };
    for ((_, f) in favorites.entries()) {
      if (f.user == caller and f.rental == rentalTitle) { Runtime.trap("Already favorited") };
    };
    let id = nextFavoriteId;
    nextFavoriteId += 1;
    favorites.add(id, { user = caller; rental = rentalTitle; createdAt = Time.now() });
    id;
  };

  public shared ({ caller }) func removeFavorite(rentalTitle : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    var foundId : ?Nat = null;
    for ((id, f) in favorites.entries()) {
      if (f.user == caller and f.rental == rentalTitle) { foundId := ?id };
    };
    switch (foundId) {
      case (null) { Runtime.trap("Favorite not found") };
      case (?id) { favorites.remove(id) };
    };
  };

  public query ({ caller }) func isFavorited(rentalTitle : Text) : async Bool {
    for ((_, f) in favorites.entries()) {
      if (f.user == caller and f.rental == rentalTitle) { return true };
    };
    false;
  };

  public query ({ caller }) func getUserFavorites() : async [(Nat, Favorite, Rental)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let result = List.empty<(Nat, Favorite, Rental)>();
    for ((id, f) in favorites.entries()) {
      if (f.user == caller) {
        switch (getRentalByTitle(f.rental)) {
          case (null) {};
          case (?r) { result.add((id, f, r)) };
        };
      };
    };
    result.toArray();
  };

  // ─── Search History API ───────────────────────────────────────────────────

  public shared ({ caller }) func saveSearchHistory(searchText : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextSearchHistoryId;
    nextSearchHistoryId += 1;
    searchHistories.add(id, { user = caller; searchText; createdAt = Time.now() });
    id;
  };

  public query ({ caller }) func getMySearchHistory() : async [(Nat, SearchHistory)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let result = List.empty<(Nat, SearchHistory)>();
    for ((id, h) in searchHistories.entries()) {
      if (h.user == caller) { result.add((id, h)) };
    };
    let sorted = result.toArray().sort(func(a : (Nat, SearchHistory), b : (Nat, SearchHistory)) : Order.Order {
      if (a.1.createdAt > b.1.createdAt) { #less }
      else if (a.1.createdAt < b.1.createdAt) { #greater }
      else { #equal }
    });
    if (sorted.size() <= 20) { sorted } else { sorted.sliceToArray(0, 20) };
  };


  public shared ({ caller }) func clearSearchHistory() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let toDelete = List.empty<Nat>();
    for ((id, h) in searchHistories.entries()) {
      if (h.user == caller) { toDelete.add(id) };
    };
    for (id in toDelete.toArray().vals()) {
      searchHistories.remove(id);
    };
  };

  // ─── Report API ───────────────────────────────────────────────────────────

  public shared ({ caller }) func createReport(
    rentalTitle : Text, reportedUser : Principal, reason : Text,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextReportId;
    nextReportId += 1;
    reportRecords.add(id, {
      reporter = caller; reportedUser; rental = rentalTitle;
      reason; createdAt = Time.now();
    });
    id;
  };

  // ─── Block API ────────────────────────────────────────────────────────────

  public shared ({ caller }) func blockUser(blockedUser : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    for ((_, b) in blockRecords.entries()) {
      if (b.user == caller and b.blockedUser == blockedUser) { return };
    };
    let id = nextBlockId;
    nextBlockId += 1;
    blockRecords.add(id, { user = caller; blockedUser });
  };

  public shared ({ caller }) func unblockUser(blockedUser : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    var foundId : ?Nat = null;
    for ((id, b) in blockRecords.entries()) {
      if (b.user == caller and b.blockedUser == blockedUser) { foundId := ?id };
    };
    switch (foundId) {
      case (null) {};
      case (?id) { blockRecords.remove(id) };
    };
  };

  public query ({ caller }) func isUserBlocked(blockedUser : Principal) : async Bool {
    for ((_, b) in blockRecords.entries()) {
      if (b.user == caller and b.blockedUser == blockedUser) { return true };
    };
    false;
  };

  public query ({ caller }) func getBlockedUsers() : async [Principal] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let result = List.empty<Principal>();
    for ((_, b) in blockRecords.entries()) {
      if (b.user == caller) { result.add(b.blockedUser) };
    };
    result.toArray();
  };

  // ─── User Location API ────────────────────────────────────────────────────

  let userLocations = Map.empty<Principal, Text>();

  public shared ({ caller }) func saveMyLocation(location : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    userLocations.add(caller, location);
  };

  public query ({ caller }) func getMyLocation() : async ?Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      return null;
    };
    userLocations.get(caller);
  };

  // ─── Negotiation API ──────────────────────────────────────────────────────

  public shared ({ caller }) func createNegotiation(
    rentalTitle : Text, offerPrice : Nat, message : Text,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    switch (getRentalByTitle(rentalTitle)) {
      case (null) { Runtime.trap("Rental not found") };
      case (?_) {};
    };
    let id = nextNegotiationId;
    nextNegotiationId += 1;
    negotiations.add(id, {
      rental = rentalTitle; buyer = caller; offerPrice; message;
      status = "Pending"; createdAt = Time.now();
    });
    id;
  };

  public query ({ caller }) func getOwnerNegotiations() : async [(Nat, Negotiation, Rental)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let result = List.empty<(Nat, Negotiation, Rental)>();
    for ((id, n) in negotiations.entries()) {
      switch (getRentalByTitle(n.rental)) {
        case (null) {};
        case (?rental) {
          if (rental.createdBy == caller) {
            result.add((id, n, rental));
          };
        };
      };
    };
    result.toArray().sort(func(a : (Nat, Negotiation, Rental), b : (Nat, Negotiation, Rental)) : Order.Order {
      if (a.1.createdAt > b.1.createdAt) { #less }
      else if (a.1.createdAt < b.1.createdAt) { #greater }
      else { #equal }
    });
  };

  public query ({ caller }) func getBuyerNegotiations() : async [(Nat, Negotiation, Rental)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let result = List.empty<(Nat, Negotiation, Rental)>();
    for ((id, n) in negotiations.entries()) {
      if (n.buyer == caller) {
        switch (getRentalByTitle(n.rental)) {
          case (null) {};
          case (?rental) { result.add((id, n, rental)) };
        };
      };
    };
    result.toArray().sort(func(a : (Nat, Negotiation, Rental), b : (Nat, Negotiation, Rental)) : Order.Order {
      if (a.1.createdAt > b.1.createdAt) { #less }
      else if (a.1.createdAt < b.1.createdAt) { #greater }
      else { #equal }
    });
  };

  public shared ({ caller }) func respondToNegotiation(negotiationId : Nat, status : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    if (status != "Accepted" and status != "Rejected") {
      Runtime.trap("Status must be Accepted or Rejected");
    };
    switch (negotiations.get(negotiationId)) {
      case (null) { Runtime.trap("Negotiation not found") };
      case (?n) {
        switch (getRentalByTitle(n.rental)) {
          case (null) { Runtime.trap("Rental not found") };
          case (?rental) {
            if (rental.createdBy != caller) {
              Runtime.trap("Unauthorized: Only the rental owner can respond to negotiations");
            };
            negotiations.add(negotiationId, {
              rental = n.rental; buyer = n.buyer; offerPrice = n.offerPrice;
              message = n.message; status; createdAt = n.createdAt;
            });
          };
        };
      };
    };
  };


  // ─── Cart API ─────────────────────────────────────────────────────────────

  public shared ({ caller }) func addToCart(rentalTitle : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    switch (getRentalByTitle(rentalTitle)) {
      case (null) { Runtime.trap("Rental not found") };
      case (?_) {};
    };
    for ((_, c) in carts.entries()) {
      if (c.user == caller and c.rental == rentalTitle) {
        Runtime.trap("Already in cart");
      };
    };
    let id = nextCartId;
    nextCartId += 1;
    carts.add(id, { user = caller; rental = rentalTitle; createdAt = Time.now() });
    id;
  };

  public shared ({ caller }) func removeFromCart(cartId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    switch (carts.get(cartId)) {
      case (null) { Runtime.trap("Cart item not found") };
      case (?c) {
        if (c.user != caller) { Runtime.trap("Unauthorized") };
        carts.remove(cartId);
      };
    };
  };

  public query ({ caller }) func getMyCart() : async [(Nat, Cart, Rental)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let result = List.empty<(Nat, Cart, Rental)>();
    for ((id, c) in carts.entries()) {
      if (c.user == caller) {
        switch (getRentalByTitle(c.rental)) {
          case (null) {};
          case (?r) { result.add((id, c, r)) };
        };
      };
    };
    result.toArray().sort(func(a : (Nat, Cart, Rental), b : (Nat, Cart, Rental)) : Order.Order {
      if (a.1.createdAt > b.1.createdAt) { #less }
      else if (a.1.createdAt < b.1.createdAt) { #greater }
      else { #equal }
    });
  };

  public query ({ caller }) func isInCart(rentalTitle : Text) : async Bool {
    for ((_, c) in carts.entries()) {
      if (c.user == caller and c.rental == rentalTitle) { return true };
    };
    false;
  };

  // ─── Cancel Order API ─────────────────────────────────────────────────────

  public shared ({ caller }) func cancelOrder(orderId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    switch (getOrderById(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.buyer != caller) {
          Runtime.trap("Unauthorized: Only the buyer can cancel this order");
        };
        if (order.status != "Pending") {
          Runtime.trap("Only pending orders can be cancelled");
        };
        ordersV3.add(orderId, { rental = order.rental; buyer = order.buyer;
          buyerPhone = order.buyerPhone; buyerEmail = order.buyerEmail;
          buyerAddress = order.buyerAddress; buyerName = order.buyerName;
          status = "Cancelled"; createdAt = order.createdAt;
          duration = order.duration; totalPrice = order.totalPrice;
          startDate = order.startDate; endDate = order.endDate });
        ordersV2.remove(orderId);
        orders.remove(orderId);
      };
    };
  };

});
