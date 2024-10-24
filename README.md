# Auction House

This is an Auction House application created using Typescript, NextJS, and AWS. It is for the graduate course CS 509: Design of Software Systems at WPI.

Link to active site: [Link to active site goes here](#)

## Authors

* Alexander Beck ([GitHub](https://github.com/AlexanderBeck0))
* Emilia Krum ([GitHub](https://github.com/MurkingtonWizard))
* Nate Prickitt ([GitHub](https://github.com/prickittn))
* Brent Weiffenbach ([GitHub](https://github.com/BrentWeiffenbach))

## Iteration One Use Cases

Here are the Use Cases we have completed for Iteration One:

* List use cases here

## Project Details

The Auction House consists of three main actors: [Seller](#seller), [Buyer](#buyer), and [Customer](#customer). Additionally, there is a fourth actor, [Admin](#admin), which controls the freezing and unfreezing of accounts and items.

### Seller

A Seller is the only actor able to sell items on the Auction House. A Seller can...

* [Create Account](create-account)
* [Close Account](close-account)
* [Login Account](login-account)
* [Add Item](add-item)
* [Remove Inactive Item](remove-inactive-item)
* [Edit Item](edit-item)
* [Publish Item](publish-item)
* [Review Items](review-items)
* [Fulfill Item](fulfill-item)
* [Unpublish Item](unpublish-item)
* [Request Account Unfreeze](request-account-unfreeze)
* [Request Item Unfreeze](request-item-unfreeze)

#### Create Account

A customer is able to create an account by going to create account. Alternatively, there is a link provided within the login page that redirects the customer to the register page. A customer cannot create an account with the username of an already existing account or an already closed account.

#### Close Account

A seller is able to close an account that does not have any items that are active. The seller cannot reopen the account. The username will be reserved, and an account cannot be created with the seller's username again.

#### Login Account

A seller can login to their account through the login page. The seller cannot log into an account that has already been closed.

#### Add Item

A seller can add an item to their account if they are not frozen. The item will initially be inactive, and the seller has to add all the information such as the item name, image, description, and initial price.

#### Remove Inactive Item

An active seller can remove an inactive item, which will **permanently delete** the item.

#### Edit Item

An active seller can edit an inactive item.

#### Publish Item

An active seller can publish an item that has all the required information for an item (name, description, initial price, image, start date, end date). The item cannot be frozen.

#### Review Items

A seller can review their items to see which ones are inactive (not yet published), active (waiting for more bids), failed (time has expired without any bids), completed (time has expired with bids) and archived (item has been fulfilled)

#### Fulfill Item

An active seller is responsible for fulfilling an item whose ending time has expired. The item cannot be frozen. Funds are withdrawn from winning buyer. Fulfilling an item archives it.

#### Unpublish Item

An active seller can unpublish an active item that does not have any current bids. Unpublishing an item makes the item inactive.

#### Request Account Unfreeze

If a seller's account is frozen, the seller can request it be unfrozen by Admin.

#### Request Item Unfreeze

If a seller's item is frozen, and the seller themselves are not frozen, the seller can request the item be unfrozen by Admin.

### Buyer

A Buyer is the only actor able to place bids on an item. A Buyer can...

* [Open Account](#open-account)
* [Close an Account](#close-an-account)
* [Login](#login)
* [Add Funds](#add-funds)
* [Search Recently Sold](#search-recently-sold)
* [Sort Recently Sold](#sort-recently-sold)
* [View Item](#view-item)
* [Place Bid](#place-bid)
* [Review Active Bids](#review-active-bids)
* [Review Purchases](#review-purchases)
* [Request Unfreeze](#request-unfreeze)

#### Open Account

#### Close an Account

#### Login

#### Add Funds

#### Search Recently Sold

#### Sort Recently Sold

#### View Item

#### Place Bid

#### Review Active Bids

#### Review Purchases

#### Request Unfreeze

### Customer

A Customer is the only actor that does not require logging in. Customers have the capability to [Search Items](#search-items), [Sort Items](#sort-items), and [View Items](#view-items).

#### Search Items

A Customer can search all active items using keywords (as a potential substring of name or description ignoring type) and price ranges.

Examples of search keywords include ITEM | name | price | start date | end date.

#### Sort Items

A Customer can sort all active items by price, date (published date and expiration date).

#### View Items

A Customer can view an active item (with only the highest bid shown, or initial if there are no bids) and see its description and any of its images.

### Admin

There only exists one Admin within the Auction House. Admin has the ability to [Freeze](#freeze-buyer)/[Unfreeze](#unfreeze-buyer) buyer, [Freeze](#freeze-seller)/[Unfreeze](#unfreeze-seller) seller, and [Freeze](#freeze-item)/[Unfreeze](#unfreeze-item) items. Additionally, Admin can [Generate Auction Report](#generate-auction-report) and [Generate Forensics Report](#generate-forensics-report).

#### Freeze Buyer

Admin can freeze a buyer (that is not already frozen). Once frozen, the buyer is unable to place any bids. Additionally, all the buyer's active bids are canceled. The buyer can login and request their account to be unfrozen.

#### Unfreeze Buyer

Admin can unfreeze a buyer that is frozen. Once unfrozen, all the buyer's capabilities return to normal, but all bids that were canceled are not reinstated. The buy is able to bid on the items where their bids were canceled again if the bid has not expired.

#### Freeze Seller

Admin can freeze a seller (that is not already frozen). When Admin freezes a seller account, all of the items that seller has (which are active) are then frozen. Once frozen, the seller can only login to their account where they can request to be unfrozen.

#### Unfreeze Seller

#### Freeze Item

#### Unfreeze Item

#### Generate Auction Report

#### Generate Forensics Report
