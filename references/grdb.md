## What is GRDB?

Use this library to save your application’s permanent data into SQLite databases. It comes with built-in tools that address common needs:

- **SQL Generation**

    Enhance your application models with persistence and fetching methods, so that you don't have to deal with SQL and raw database rows when you don't want to.

- **Database Observation**

    Get notifications when database values are modified.

- **Robust Concurrency**

    Multi-threaded applications can efficiently use their databases, including WAL databases that support concurrent reads and writes.

- **Migrations**

    Evolve the schema of your database as you ship new versions of your application.

- **Leverage your SQLite skills**

    Not all developers need advanced SQLite features. But when you do, GRDB is as sharp as you want it to be. Come with your SQL and SQLite skills, or learn new ones as you go!

---

<p align="center">
    <a href="#usage">Usage</a> &bull;
    <a href="#documentation">Documentation</a> &bull;
    <a href="#installation">Installation</a> &bull;
    <a href="#faq">FAQ</a>
</p>

---

## Usage

<details open>
  <summary>Start using the database in four steps</summary>

```swift
import GRDB

// 1. Open a database connection
let dbQueue = try DatabaseQueue(path: "/path/to/database.sqlite")

// 2. Define the database schema
try dbQueue.write { db in
    try db.create(table: "player") { t in
        t.primaryKey("id", .text)
        t.column("name", .text).notNull()
        t.column("score", .integer).notNull()
    }
}

// 3. Define a record type
struct Player: Codable, Identifiable, FetchableRecord, PersistableRecord {
    var id: String
    var name: String
    var score: Int

    enum Columns {
        static let name = Column(CodingKeys.name)
        static let score = Column(CodingKeys.score)
    }
}

// 4. Write and read in the database
try dbQueue.write { db in
    try Player(id: "1", name: "Arthur", score: 100).insert(db)
    try Player(id: "2", name: "Barbara", score: 1000).insert(db)
}

try dbQueue.read { db in
    let player = try Player.find(db, id: "1"))

    let bestPlayers = try Player
        .order(\.score.desc)
        .limit(10)
        .fetchAll(db)
}
```

</details>

<details>
    <summary>Access to raw SQL</summary>

```swift
try dbQueue.write { db in
    try db.execute(sql: """
        CREATE TABLE player (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          score INT NOT NULL)
        """)

    try db.execute(sql: """
        INSERT INTO player (id, name, score)
        VALUES (?, ?, ?)
        """, arguments: ["1", "Arthur", 100])

    // Avoid SQL injection with SQL interpolation
    let id = "2"
    let name = "O'Brien"
    let score = 1000
    try db.execute(literal: """
        INSERT INTO player (id, name, score)
        VALUES (\(id), \(name), \(score))
        """)
}
```

See [Executing Updates](#executing-updates)

</details>

<details>
    <summary>Access to raw database rows and values</summary>

```swift
try dbQueue.read { db in
    // Fetch database rows
    let rows = try Row.fetchCursor(db, sql: "SELECT * FROM player")
    while let row = try rows.next() {
        let id: String = row["id"]
        let name: String = row["name"]
        let score: Int = row["score"]
    }

    // Fetch values
    let playerCount = try Int.fetchOne(db, sql: "SELECT COUNT(*) FROM player")! // Int
    let playerNames = try String.fetchAll(db, sql: "SELECT name FROM player") // [String]
}

let playerCount = try dbQueue.read { db in
    try Int.fetchOne(db, sql: "SELECT COUNT(*) FROM player")!
}
```

See [Fetch Queries](#fetch-queries)

</details>

<details>
    <summary>Database model types aka "records"</summary>

```swift
struct Player: Codable, Identifiable, FetchableRecord, PersistableRecord {
    var id: String
    var name: String
    var score: Int

    enum Columns {
        static let name = Column(CodingKeys.name)
        static let score = Column(CodingKeys.score)
    }
}

try dbQueue.write { db in
    // Create database table
    try db.create(table: "player") { t in
        t.primaryKey("id", .text)
        t.column("name", .text).notNull()
        t.column("score", .integer).notNull()
    }

    // Insert a record
    var player = Player(id: "1", name: "Arthur", score: 100)
    try player.insert(db)

    // Update a record
    player.score += 10
    try score.update(db)

    try player.updateChanges { $0.score += 10 }

    // Delete a record
    try player.delete(db)
}
```

See [Records](#records)

</details>

<details>
    <summary>Query the database with the Swift query interface</summary>

```swift
try dbQueue.read { db in
    // Player
    let player = try Player.find(db, id: "1")

    // Player?
    let arthur = try Player.filter { $0.name == "Arthur" }.fetchOne(db)

    // [Player]
    let bestPlayers = try Player.order(\.score.desc).limit(10).fetchAll(db)

    // Int
    let playerCount = try Player.fetchCount(db)

    // SQL is always welcome
    let players = try Player.fetchAll(db, sql: "SELECT * FROM player")
}
```

See the [Query Interface](#the-query-interface)

</details>

<details>
    <summary>Database changes notifications</summary>

```swift
// Define the observed value
let observation = ValueObservation.tracking { db in
    try Player.fetchAll(db)
}

// Start observation
let cancellable = observation.start(
    in: dbQueue,
    onError: { error in ... },
    onChange: { (players: [Player]) in print("Fresh players: \(players)") })
```

Ready-made support for Combine and RxSwift:

```swift
// Swift concurrency
for try await players in observation.values(in: dbQueue) {
    print("Fresh players: \(players)")
}

// Combine
let cancellable = observation.publisher(in: dbQueue).sink(
    receiveCompletion: { completion in ... },
    receiveValue: { (players: [Player]) in print("Fresh players: \(players)") })

// RxSwift
let disposable = observation.rx.observe(in: dbQueue).subscribe(
    onNext: { (players: [Player]) in print("Fresh players: \(players)") },
    onError: { error in ... })
```

See [Database Observation], [Combine Support], [RxGRDB].

</details>

Documentation
=============

**GRDB runs on top of SQLite**: you should get familiar with the [SQLite FAQ](http://www.sqlite.org/faq.html). For general and detailed information, jump to the [SQLite Documentation](http://www.sqlite.org/docs.html).


### Demo Applications & Frequently Asked Questions

- [Demo Applications]
- [FAQ]

### Reference

- 📖 [GRDB Reference](https://swiftpackageindex.com/groue/GRDB.swift/documentation/grdb/)

### Getting Started

- [Installation](#installation)
- [Database Connections]: Connect to SQLite databases

### SQLite and SQL

- [SQLite API](#sqlite-api): The low-level SQLite API &bull; [executing updates](#executing-updates) &bull; [fetch queries](#fetch-queries) &bull; [SQL Interpolation]

### Records and the Query Interface

- [Records](#records): Fetching and persistence methods for your custom structs and class hierarchies
- [Query Interface](#the-query-interface): A swift way to generate SQL &bull; [create tables, indexes, etc](https://swiftpackageindex.com/groue/GRDB.swift/documentation/grdb/databaseschema) &bull; [requests](#requests) • [associations between record types](Documentation/AssociationsBasics.md)

### Application Tools

- [Migrations]: Transform your database as your application evolves.
- [Full-Text Search]: Perform efficient and customizable full-text searches.
- [Database Observation]: Observe database changes and transactions.
- [Encryption](#encryption): Encrypt your database with SQLCipher.
- [Backup](#backup): Dump the content of a database to another.
- [Interrupt a Database](#interrupt-a-database): Abort any pending database operation.
- [Sharing a Database]: How to share an SQLite database between multiple processes - recommendations for App Group containers, App Extensions, App Sandbox, and file coordination.

### Good to Know

- [Concurrency]: How to access databases in a multi-threaded application.
- [Combine](Documentation/Combine.md): Access and observe the database with Combine publishers.
- [Avoiding SQL Injection](#avoiding-sql-injection)
- [Error Handling](#error-handling)
- [Unicode](#unicode)
- [Memory Management](#memory-management)
- [Data Protection](https://swiftpackageindex.com/groue/GRDB.swift/documentation/grdb/databaseconnections)
- :bulb: [Migrating From GRDB 6 to GRDB 7](Documentation/Documentation/GRDB7MigrationGuide.md)
- :bulb: [Why Adopt GRDB?](Documentation/WhyAdoptGRDB.md)
- :bulb: [Recommended Practices for Designing Record Types](https://swiftpackageindex.com/groue/GRDB.swift/documentation/grdb/recordrecommendedpractices)

### Companion Libraries

- [GRDBQuery](https://github.com/groue/GRDBQuery): Access and observe the database from your SwiftUI views.
- [GRDBSnapshotTesting](https://github.com/groue/GRDBSnapshotTesting): Test your database.

**[FAQ]**

**[Sample Code](#sample-code)**


Database Connections
====================

GRDB provides two classes for accessing SQLite databases: [`DatabaseQueue`] and [`DatabasePool`]:

```swift
import GRDB

// Pick one:
let dbQueue = try DatabaseQueue(path: "/path/to/database.sqlite")
let dbPool = try DatabasePool(path: "/path/to/database.sqlite")
```

The differences are:

- Database pools allow concurrent database accesses (this can improve the performance of multithreaded applications).
- Database pools open your SQLite database in the [WAL mode](https://www.sqlite.org/wal.html) (unless read-only).
- Database queues support [in-memory databases](https://www.sqlite.org/inmemorydb.html).

**If you are not sure, choose [`DatabaseQueue`].** You will always be able to switch to [`DatabasePool`] later.

For more information and tips when opening connections, see [Database Connections](https://swiftpackageindex.com/groue/GRDB.swift/documentation/grdb/databaseconnections).


Encryption
==========

**GRDB can encrypt your database with [SQLCipher](http://sqlcipher.net) v3.4+.**

Use [CocoaPods](http://cocoapods.org/), and specify in your `Podfile`:

```ruby
# GRDB with SQLCipher 4
pod 'GRDB.swift/SQLCipher'
pod 'SQLCipher', '~> 4.0'

# GRDB with SQLCipher 3
pod 'GRDB.swift/SQLCipher'
pod 'SQLCipher', '~> 3.4'
```

Make sure you remove any existing `pod 'GRDB.swift'` from your Podfile. `GRDB.swift/SQLCipher` must be the only active GRDB pod in your whole project, or you will face linker or runtime errors, due to the conflicts between SQLCipher and the system SQLite.

- [Creating or Opening an Encrypted Database](#creating-or-opening-an-encrypted-database)
- [Changing the Passphrase of an Encrypted Database](#changing-the-passphrase-of-an-encrypted-database)
- [Exporting a Database to an Encrypted Database](#exporting-a-database-to-an-encrypted-database)
- [Security Considerations](#security-considerations)


### Creating or Opening an Encrypted Database

**You create and open an encrypted database** by providing a passphrase to your [database connection]:

```swift
var config = Configuration()
config.prepareDatabase { db in
    try db.usePassphrase("secret")
}
let dbQueue = try DatabaseQueue(path: dbPath, configuration: config)
```

It is also in `prepareDatabase` that you perform other [SQLCipher configuration steps](https://www.zetetic.net/sqlcipher/sqlcipher-api/) that must happen early in the lifetime of a SQLCipher connection. For example:

```swift
var config = Configuration()
config.prepareDatabase { db in
    try db.usePassphrase("secret")
    try db.execute(sql: "PRAGMA cipher_page_size = ...")
    try db.execute(sql: "PRAGMA kdf_iter = ...")
}
let dbQueue = try DatabaseQueue(path: dbPath, configuration: config)
```

When you want to open an existing SQLCipher 3 database with SQLCipher 4, you may want to run the `cipher_compatibility` pragma:

```swift
// Open an SQLCipher 3 database with SQLCipher 4
var config = Configuration()
config.prepareDatabase { db in
    try db.usePassphrase("secret")
    try db.execute(sql: "PRAGMA cipher_compatibility = 3")
}
let dbQueue = try DatabaseQueue(path: dbPath, configuration: config)
```

See [SQLCipher 4.0.0 Release](https://www.zetetic.net/blog/2018/11/30/sqlcipher-400-release/) and [Upgrading to SQLCipher 4](https://discuss.zetetic.net/t/upgrading-to-sqlcipher-4/3283) for more information.


### Changing the Passphrase of an Encrypted Database

**You can change the passphrase** of an already encrypted database.

When you use a [database queue](https://swiftpackageindex.com/groue/GRDB.swift/documentation/grdb/databasequeue), open the database with the old passphrase, and then apply the new passphrase:

```swift
try dbQueue.write { db in
    try db.changePassphrase("newSecret")
}
```

When you use a [database pool](https://swiftpackageindex.com/groue/GRDB.swift/documentation/grdb/databasepool), make sure that no concurrent read can happen by changing the passphrase within the `barrierWriteWithoutTransaction` block. You must also ensure all future reads open a new database connection by calling the `invalidateReadOnlyConnections` method:

```swift
try dbPool.barrierWriteWithoutTransaction { db in
    try db.changePassphrase("newSecret")
    dbPool.invalidateReadOnlyConnections()
}
```

> **Note**: When an application wants to keep on using a database queue or pool after the passphrase has changed, it is responsible for providing the correct passphrase to the `usePassphrase` method called in the database preparation function. Consider:
>
> ```swift
> // WRONG: this won't work across a passphrase change
> let passphrase = try getPassphrase()
> var config = Configuration()
> config.prepareDatabase { db in
>     try db.usePassphrase(passphrase)
> }
>
> // CORRECT: get the latest passphrase when it is needed
> var config = Configuration()
> config.prepareDatabase { db in
>     let passphrase = try getPassphrase()
>     try db.usePassphrase(passphrase)
> }
> ```

> **Note**: The `DatabasePool.barrierWriteWithoutTransaction` method does not prevent [database snapshots](https://swiftpackageindex.com/groue/GRDB.swift/documentation/grdb/databasesnapshot) from accessing the database during the passphrase change, or after the new passphrase has been applied to the database. Those database accesses may throw errors. Applications should provide their own mechanism for invalidating open snapshots before the passphrase is changed.

> **Note**: Instead of changing the passphrase "in place" as described here, you can also export the database in a new encrypted database that uses the new passphrase. See [Exporting a Database to an Encrypted Database](#exporting-a-database-to-an-encrypted-database).


### Exporting a Database to an Encrypted Database

Providing a passphrase won't encrypt a clear-text database that already exists, though. SQLCipher can't do that, and you will get an error instead: `SQLite error 26: file is encrypted or is not a database`.

Instead, create a new encrypted database, at a distinct location, and export the content of the existing database. This can both encrypt a clear-text database, or change the passphrase of an encrypted database.

The technique to do that is [documented](https://discuss.zetetic.net/t/how-to-encrypt-a-plaintext-sqlite-database-to-use-sqlcipher-and-avoid-file-is-encrypted-or-is-not-a-database-errors/868/1) by SQLCipher.

With GRDB, it gives:

```swift
// The existing database
let existingDBQueue = try DatabaseQueue(path: "/path/to/existing.db")

// The new encrypted database, at some distinct location:
var config = Configuration()
config.prepareDatabase { db in
    try db.usePassphrase("secret")
}
let newDBQueue = try DatabaseQueue(path: "/path/to/new.db", configuration: config)

try existingDBQueue.inDatabase { db in
    try db.execute(
        sql: """
            ATTACH DATABASE ? AS encrypted KEY ?;
            SELECT sqlcipher_export('encrypted');
            DETACH DATABASE encrypted;
            """,
        arguments: [newDBQueue.path, "secret"])
}

// Now the export is completed, and the existing database can be deleted.
```


### Security Considerations

### Managing the lifetime of the passphrase string

It is recommended to avoid keeping the passphrase in memory longer than necessary. To do this, make sure you load the passphrase from the `prepareDatabase` method:

```swift
// NOT RECOMMENDED: this keeps the passphrase in memory longer than necessary
let passphrase = try getPassphrase()
var config = Configuration()
config.prepareDatabase { db in
    try db.usePassphrase(passphrase)
}

// RECOMMENDED: only load the passphrase when it is needed
var config = Configuration()
config.prepareDatabase { db in
    let passphrase = try getPassphrase()
    try db.usePassphrase(passphrase)
}
```

This technique helps manages the lifetime of the passphrase, although keep in mind that the content of a String may remain intact in memory long after the object has been released.

For even better control over the lifetime of the passphrase in memory, use a Data object which natively provides the `resetBytes` function.

```swift
// RECOMMENDED: only load the passphrase when it is needed and reset its content immediately after use
var config = Configuration()
config.prepareDatabase { db in
    var passphraseData = try getPassphraseData() // Data
    defer {
        passphraseData.resetBytes(in: 0..<passphraseData.count)
    }
    try db.usePassphrase(passphraseData)
}
```

Some demanding users will want to go further, and manage the lifetime of the raw passphrase bytes. See below.


### Managing the lifetime of the passphrase bytes

GRDB offers convenience methods for providing the database passphrases as Swift strings: `usePassphrase(_:)` and `changePassphrase(_:)`. Those methods don't keep the passphrase String in memory longer than necessary. But they are as secure as the standard String type: the lifetime of actual passphrase bytes in memory is not under control.

When you want to precisely manage the passphrase bytes, talk directly to SQLCipher, using its raw C functions.

For example:

```swift
var config = Configuration()
config.prepareDatabase { db in
    ... // Carefully load passphrase bytes
    let code = sqlite3_key(db.sqliteConnection, /* passphrase bytes */)
    ... // Carefully dispose passphrase bytes
    guard code == SQLITE_OK else {
        throw DatabaseError(
            resultCode: ResultCode(rawValue: code),
            message: db.lastErrorMessage)
    }
}
let dbQueue = try DatabaseQueue(path: dbPath, configuration: config)
```

### Passphrase availability vs. Database availability

When the passphrase is securely stored in the system keychain, your application can protect it using the [`kSecAttrAccessible`](https://developer.apple.com/documentation/security/ksecattraccessible) attribute.

Such protection prevents GRDB from creating SQLite connections when the passphrase is not available:

```swift
var config = Configuration()
config.prepareDatabase { db in
    let passphrase = try loadPassphraseFromSystemKeychain()
    try db.usePassphrase(passphrase)
}

// Success if and only if the passphrase is available
let dbQueue = try DatabaseQueue(path: dbPath, configuration: config)
```

For the same reason, [database pools], which open SQLite connections on demand, may fail at any time as soon as the passphrase becomes unavailable:

```swift
// Success if and only if the passphrase is available
let dbPool = try DatabasePool(path: dbPath, configuration: config)

// May fail if passphrase has turned unavailable
try dbPool.read { ... }

// May trigger value observation failure if passphrase has turned unavailable
try dbPool.write { ... }
```

Because DatabasePool maintains a pool of long-lived SQLite connections, some database accesses will use an existing connection, and succeed. And some other database accesses will fail, as soon as the pool wants to open a new connection. It is impossible to predict which accesses will succeed or fail.

For the same reason, a database queue, which also maintains a long-lived SQLite connection, will remain available even after the passphrase has turned unavailable.

Applications are thus responsible for protecting database accesses when the passphrase is unavailable. To this end, they can use [Data Protection](https://developer.apple.com/documentation/uikit/protecting_the_user_s_privacy/encrypting_your_app_s_files). They can also destroy their instances of database queue or pool when the passphrase becomes unavailable.
