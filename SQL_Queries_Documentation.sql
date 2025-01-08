USE [clothing-ecommerce]
GO

/** Object:  User [ecommerce_user] **/
CREATE USER [ecommerce_user] FOR LOGIN [ecommerce_user] WITH DEFAULT_SCHEMA=[dbo]
GO
ALTER ROLE [db_datareader] ADD MEMBER [ecommerce_user]
GO
ALTER ROLE [db_datawriter] ADD MEMBER [ecommerce_user]
GO

/** Object:  Table [dbo].[Users] **/
CREATE TABLE [dbo].[Users](
    [UserID] [int] IDENTITY(1,1) NOT NULL,
    [Name] [nvarchar](100) NOT NULL,
    [Email] [nvarchar](100) NOT NULL,
    [Password] [nvarchar](100) NOT NULL,
    PRIMARY KEY CLUSTERED ([UserID] ASC),
    UNIQUE NONCLUSTERED ([Email] ASC)
) ON [PRIMARY]
GO

/** Object:  Table [dbo].[Products] **/
CREATE TABLE [dbo].[Products](
    [ProductID] [int] IDENTITY(1,1) NOT NULL,
    [Name] [nvarchar](100) NOT NULL,
    [Price] [decimal](10, 2) NOT NULL,
    [ImageURL] [nvarchar](255) NOT NULL,
    [Description] [nvarchar](255) NOT NULL,
    [Sizes] [nvarchar](max) NOT NULL,
    PRIMARY KEY CLUSTERED ([ProductID] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/** Object:  Table [dbo].[Cart] **/
CREATE TABLE [dbo].[Cart](
    [CartID] [int] IDENTITY(1,1) NOT NULL,
    [UserID] [int] NOT NULL,
    PRIMARY KEY CLUSTERED ([CartID] ASC),
    CONSTRAINT [FK_Cart_User] FOREIGN KEY ([UserID]) REFERENCES [dbo].[Users] ([UserID])
) ON [PRIMARY]
GO

/** Object:  Table [dbo].[CartItems] **/
CREATE TABLE [dbo].[CartItems](
    [CartItemID] [int] IDENTITY(1,1) NOT NULL,
    [CartID] [int] NOT NULL,
    [ProductID] [int] NOT NULL,
    [Quantity] [int] NOT NULL DEFAULT 1,
    [Size] [nvarchar](10) NOT NULL,
    PRIMARY KEY CLUSTERED ([CartItemID] ASC),
    CONSTRAINT [FK_CartItems_Cart] FOREIGN KEY ([CartID]) REFERENCES [dbo].[Cart] ([CartID]),
    CONSTRAINT [FK_CartItems_Product] FOREIGN KEY ([ProductID]) REFERENCES [dbo].[Products] ([ProductID])
) ON [PRIMARY]
GO

/** Object:  Table [dbo].[Orders] **/
CREATE TABLE [dbo].[Orders](
    [OrderID] [int] IDENTITY(1,1) NOT NULL,
    [UserID] [int] NOT NULL,
    [TotalAmount] [decimal](10, 2) NOT NULL,
    [ShippingAddress] [nvarchar](255) NOT NULL,
    [PaymentMethod] [nvarchar](50) NOT NULL,
    [Status] [nvarchar](50) NOT NULL,
    [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE(),
    [UpdatedAt] [datetime] NOT NULL DEFAULT GETDATE(),
    [TrackingNumber] [nvarchar](100) NULL,
    PRIMARY KEY CLUSTERED ([OrderID] ASC),
    CONSTRAINT [FK_Orders_User] FOREIGN KEY ([UserID]) REFERENCES [dbo].[Users] ([UserID]),
    CONSTRAINT [CHK_PaymentMethod] CHECK ([PaymentMethod] IN ('Visa', 'COD')),
    CONSTRAINT [CHK_Status] CHECK ([Status] IN ('Pending', 'Shipped', 'Delivered'))
) ON [PRIMARY]
GO

/** Object:  Table [dbo].[OrderItems] **/
CREATE TABLE [dbo].[OrderItems](
    [OrderItemID] [int] IDENTITY(1,1) NOT NULL,
    [OrderID] [int] NOT NULL,
    [ProductID] [int] NOT NULL,
    [Quantity] [int] NOT NULL,
    [Price] [decimal](10, 2) NOT NULL,
    [Discount] [decimal](10, 2) NULL DEFAULT 0.00,
    [Size] [nvarchar](10) NULL,
    PRIMARY KEY CLUSTERED ([OrderItemID] ASC),
    CONSTRAINT [FK_OrderItems_Order] FOREIGN KEY ([OrderID]) REFERENCES [dbo].[Orders] ([OrderID]),
    CONSTRAINT [FK_OrderItems_Product] FOREIGN KEY ([ProductID]) REFERENCES [dbo].[Products] ([ProductID])
) ON [PRIMARY]
GO

/** Object:  Table [dbo].[Wishlist] **/
CREATE TABLE [dbo].[Wishlist](
    [WishlistID] [int] IDENTITY(1,1) NOT NULL,
    [UserID] [int] NOT NULL,
    [ProductID] [int] NOT NULL,
    PRIMARY KEY CLUSTERED ([WishlistID] ASC),
    CONSTRAINT [FK_Wishlist_User] FOREIGN KEY ([UserID]) REFERENCES [dbo].[Users] ([UserID]),
    CONSTRAINT [FK_Wishlist_Product] FOREIGN KEY ([ProductID]) REFERENCES [dbo].[Products] ([ProductID])
) ON [PRIMARY]
GO
