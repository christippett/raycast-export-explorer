SQLCipher API - Full Database Encryption PRAGMAs, Functions, and Settings
=========================================================================

[Commercial & Enterprise Edition Feature](https://www.zetetic.net/sqlcipher/buy/)

SQLCipher is based on SQLite, and thus, the majority of the accessible API is identical to the C/C++ interface for SQLite 3. However, SQLCipher does add a number of security specific extensions in the form of PRAGMAs, SQL Functions, and C Functions.

[Table Of Contents](#table-of-contents)
---------------------------------------

### [Setting the Key](#key)

[**PRAGMA key**](#PRAGMA_key)

Set the key for use with the database.

[**sqlite3\_key()**](#sqlite3_key)

C function providing an alternative to `PRAGMA key`.

[**sqlite3\_key\_v2()**](#sqlite3_key)

C function providing an alternative to `PRAGMA key`.

### [Commercial & Enterprise Features](#Commercial_Enterprise)

[**PRAGMA cipher\_license**](#cipher_license)

Provide a valid License Code to unlock the library.

[**PRAGMA cipher\_fips\_status**](#cipher_fips_status)

Check whether the library is using FIPS 140-2 validated cryptographic module.

[**PRAGMA cipher\_stat\_crypto**](#cipher_stat_crypto)

Enable cryptograpic performance counters.

[**PRAGMA cipher\_stat\_memory**](#cipher_stat_memory)

Enable memory performance counters.

[**sqlcipher\_vle()**](#sqlcipher_vle)

Value and Table Level Encryption functions.

[**sqlcipher\_perf()**](#sqlcipher_perf)

Benchmark and Performance testing functions.

### [Changing the Key](#Changing_Key)

[**PRAGMA rekey**](#rekey)

Change the encryption key for a SQLCipher database.

[**sqlite3\_rekey()**](#sqlite3_rekey)

C function providing an alternative to `PRAGMA rekey`.

[**sqlite3\_rekey\_v2()**](#sqlite3_rekey)

C function providing an alternative to `PRAGMA rekey`.

### [Key Options](#Key_Options)

[**PRAGMA cipher\_plaintext\_header\_size**](#cipher_plaintext_header_size)

The number of bytes of the database header to leave in plaintext.

[**PRAGMA cipher\_salt**](#cipher_salt)

The database salt to use formatted as a hex-ecoded binary blob.

[**PRAGMA kdf\_iter**](#kdf_iter)

Change the number of iterations used with PBKDF2 key derivation.

[**PRAGMA cipher\_kdf\_algorithm**](#cipher_kdf_algorithm)

The key derivation algorithm to use for computing an encryption key.

### [Configuration (Encryption Settings)](#Configuration)

[**PRAGMA cipher\_use\_hmac**](#cipher_use_hmac)

Disable the use of per-page HMAC checks for backwards compatibility with SQLCipher 1.1.x on a specific database.

[**PRAGMA cipher\_memory\_security**](#cipher_memory_security)

Full memory wiping of all memory allocated by the library. This feature is disabled by default.

[**PRAGMA cipher\_add\_random**](#cipher_add_random)

Add externally sourced random data to the crypto provider.

### [Migration and Compatibility](#Migrating_Databases)

[**PRAGMA cipher\_migrate**](#cipher_migrate)

Convenience function to perform an in-place upgrade from a SQLCipher 1.x, 2.x, or 3.x database to SQLCipher Version 4 default settings.

[**ATTACH**](#attach)

Attach a new or existing database to the main database using a specific key.

[**sqlcipher\_export()**](#sqlcipher_export)

Convenience function that can duplicate a database contents to an attached database with different settings.

[**PRAGMA cipher\_compatibility**](#cipher_compatibility)

Force SQLCipher to operate with default settings consistent with that major version number for the current connection.

### [Performance](#Performance)

[**PRAGMA cipher\_page\_size**](#cipher_page_size)

Alter the page size used for the database from the default of 4096 bytes to improve performance for some query types.

[**PRAGMA cipher\_profile**](#cipher_profile)

Profile queries and their execution time when debugging performance issues.

[**PRAGMA cipher\_kdf\_cache**](#cipher_kdf_cache)

Controls the caching of KDF function output for performance enhancement.

### [Utilities](#Utilities)

[**cipher\_settings**](#cipher_settings)

Description of this Item.

[**PRAGMA cipher\_integrity\_check**](#cipher_integrity_check)

Performs an independent verification of each database page based on each page HMAC and provides a report of any invalid pages or errors.

[**PRAGMA cipher\_provider**](#cipher_provider)

Provides the name of the compiled crypto provider.

[**PRAGMA cipher\_provider\_version**](https://www.zetetic.net/sqlcipher/sqlcipher-api#cipher_provider_version)

Provides the version number of the compiled crypto provider.

[**PRAGMA cipher\_version**](#cipher_version)

Provides the compiled SQLCipher version number as a string.

[**PRAGMA cipher\_log**](#cipher_log)

Write internal log information to the specified target.

[**PRAGMA cipher\_log\_level**](#cipher_log_level)

Set the level of internal log information to be logged.

[**PRAGMA cipher\_log\_source**](#cipher_log_source)

Set source of the messages to be logged.

### [Default PRAGMAs](#Default_PRAGMAs)

[**PRAGMA cipher\_default\_kdf\_iter**](#cipher_default_kdf_iter)

Change the default number of iterations used with PBKDF2 key derivation.

[**PRAGMA cipher\_default\_settings**](#cipher_default_settings)

Provides the current runtime settings used when attaching a database.

[**PRAGMA cipher\_default\_compatibility**](#cipher_default_compatibility)

Force SQLCipher to operate with the default settings consistent with that major version number as the default for the currently executing process (i.e. all connections opened after the statement executes).

[**PRAGMA cipher\_default\_kdf\_algorithm**](#cipher_default_kdf_algorithm)

The key derivation algorithm to use for computing an encryption key when attaching a database.

[**PRAGMA cipher\_hmac\_algorithm**](#cipher_hmac_algorithm)

The HMAC algorithm used for both HMAC and key derivation.

[**PRAGMA cipher\_default\_plaintext\_header\_size**](#cipher_default_plaintext_header_size)

The number of bytes of the database header to leave in plaintext when attaching a database.

[**PRAGMA cipher\_default\_page\_size**](#cipher_default_page_size)

Set non-default page size to use when attaching a database.

[**PRAGMA cipher\_default\_use\_hmac**](#cipher_default_use_hmac)

Alter the default behavior for whether per-page HMAC will be used the next time a SQLCipher database is opened.

[Setting The Key](#key)
-----------------------

### [PRAGMA key](#PRAGMA_key)

The process of creating a new, encrypted database is called “keying” the database. SQLCipher uses just-in-time key derivation at the point it is first needed for an operation. This means that the key (and any options) must be set before the first operation on the database. As soon as the database is touched (e.g. `SELECT, CREATE TABLE, UPDATE`, etc.) and pages need to be read or written, the key is prepared for use.

#### [Example 1: Passphrase with Key Derivation](#example-1-passphrase-with-key-derivation)

The key itself can be a passphrase, which is converted to a key using [PBKDF2 key derivation](https://en.wikipedia.org/wiki/PBKDF2). The result is used as the encryption key for the database.

    sqlite> PRAGMA key = 'passphrase';
    

#### [Example 2: Raw Key Data (Without Key Derivation)](#example-2-raw-key-data-without-key-derivation)

Alternatively, it is possible to specify an exact byte sequence using a blob literal. With this method, it is the calling application’s responsibility to ensure that the data provided is a 64 character hex string, which will be converted directly to 32 bytes (256 bits) of key data.

    sqlite> PRAGMA key = "x'2DD29CA851E7B56E4697B0E1F08507293D761A05CE4D1B628663F411A8086D99'";
    

#### [Example 3: Raw Key Data with Explicit Salt (Without Key Derivation)](#example-3-raw-key-data-with-explicit-salt-without-key-derivation)

Finally, it is possible to specify an exact byte sequence for the key while also providing a specific database salt to use. Normally, a database salt value is generated randomly by SQLCipher and stored in the first 16 bytes of the database. With this key format an application would provide 96 characters, hex encoded in BLOB format. The first 64 characters (32 bytes) will be used as the raw encryption key, and the remaining 32 characters (16 bytes) will be used as the salt:

      PRAGMA key = "x'98483C6EB40B6C31A448C22A66DED3B5E5E8D5119CAC8327B655C8B5C483648101010101010101010101010101010101'";
    

#### [Testing the Key](#testing-the-key)

When opening an existing database, `PRAGMA key` will not immediately throw an error if the key provided is incorrect. To test that the database can be successfully opened with the provided key, it is necessary to perform some operation on the database (i.e. read from it) and confirm it is success.

The easiest way to do this is select off the sqlite\_master table, which will attempt to read the first page of the database and will parse the schema.

    sqlite> PRAGMA key = 'passphrase';
    sqlite> SELECT count(*) FROM sqlite_master; -- if this throws an error, the key was incorrect. If it succeeds and returns a numeric value, the key is correct;
    

The same check can be implemented in C code

     sqlite3_key(database, "test123", 7);
    if (sqlite3_exec(database, "SELECT count(*) FROM sqlite_master;", NULL, NULL, NULL) == SQLITE_OK) {
      // key is correct.
    } else {
      // key is incorrect
    }
    

#### [Implementation Notes](#notes-key)

*   `PRAGMA key` should generally be called as the first operation on a database.

### [sqlite3\_key() and sqlite3\_key\_v2()](#sqlite3_key)

It is possible to set the key for use with a database handle programmatically without invoking the SQL `PRAGMA key` interface. This is often desirable when linking SQLCipher in with a C/C++ application. sqlite3\_key() is actually called internally by the PRAGMA interface. The sqlite3\_key\_v2 call performs the same way as sqlite3\_key, but sets the encryption key on a named database instead of the main database.

    int sqlite3_key(
      sqlite3 *db,                   /* Database to be keyed */
      const void *pKey, int nKey     /* The key, and the length of the key in bytes */
    );
    int sqlite3_key_v2(
      sqlite3 *db,                   /* Database to be keyed */
      const char *zDbName,           /* Name of the database */
      const void *pKey, int nKey     /* The key */
    );
    

[Commercial & Enterprise Features](#Commercial_Enterprise)
----------------------------------------------------------

### [PRAGMA cipher\_license](#cipher_license)

When using Commercial or Enterprise packages you must call `PRAGMA cipher_license` with a valid license code prior to executing cryptographic operations on an encrypted database. Failure to provide a license code, or use of an expired trial code, will result in an `SQLITE_AUTH (23)` error code reported from the SQLite API (or an equivalent exception from the wrapping library. The general syntax follows:

    PRAGMA cipher_license = 'OmNpZDowMDFHMDA...';
    

In addition to setting the license code by PRAGMA, it is also possible to provide the license code without modifying the application code. Starting in SQLCipher 4.10.0, the license code value may also be set in:

*   The environmental variable `CIPHER_LICENSE`
*   A file named `cipher_license` in the same directory as the SQLCipher library
*   A file named `cipher_license` in the same directory as the current executable
*   A file named `cipher_license` in the same directory as the current working directory
*   A file named `cipher_license` in the `Resources` directory directory next to the main library in a macOS bundle
*   An arbitrary file path set using the `CIPHER_LICENSE_FILE` environmental variable

Trial licenses, [available prior to purchase](https://www.zetetic.net/sqlcipher/trial/), are valid for 15 days of testing.

### [PRAGMA cipher\_fips\_status](#cipher_fips_status)

When using SQLCipher [Enterprise FIPS](https://www.zetetic.net/sqlcipher/fips/) packages, applications are required to check the FIPS status prior to using an encrypted database connection. This ensures that the proper validated cryptographic module has been loaded by the application, the self-tests passed, and the library is operating in FIPS mode:

    PRAGMA cipher_fips_status;
    

The FIPS status will not be initialized until the database connection has been keyed, so this PRAGMA should be called after the encryption key is set using `sqlite3_key()`, `PRAGMA key`, or the appropriate wrapper API.

This PRAGMA will return a result set containging the value 1 if the library is operating in FIPS mode.

If no result set is returned, or the result set contains any other value (e.g. 0), the the library is not operating in FIPS mode and the application should “fail save”, close the database connection, cease use of SQLCipher, and report an error.

Note that it is normal for Commercial and Community Edition packages to return 0, as those packages do not include a FIPS 140-2 validated cryptographic module. Accordingly, Commerical and Community Edition SQLCipher packages should not be used in applications where FIPS 140-2 validation is a requirement.

### [PRAGMA cipher\_stat\_crypto](#cipher_stat_crypto)

SQLCipher Commercial and Enterprise packages include an extension to expose internal encryption performance counters for optimization and tuning purposes, but it is disabled by default. To turn on statistics collection, call:

    PRAGMA cipher_stat_crypto = ON;
    

Once enabled, real-time statistics about the utilization of the SQLCipher cryptographic provider are accessed by querying the special `sqlcipher_stat` virtual table. Full documentation for this feature is [available here](https://www.zetetic.net/sqlcipher/sqlcipher-stats/).

### [PRAGMA cipher\_stat\_memory](#cipher_stat_memory)

SQLCipher Commercial and Enterprise packages include an extension to expose internal memory counters for optimization and tuning purposes. This feature is disabled by default; to turn on statistics collection, call:

    PRAGMA cipher_stat_memory = ON;
    

Once enabled, real-time memory utilization information can be accessed by querying the special `sqlcipher_stat` virtual table. Full documentation for this feature is [available here](https://www.zetetic.net/sqlcipher/sqlcipher-stats/).

### [sqlcipher\_vle\_\*()](#sqlcipher_vle)

SQLCipher Commercial and Enterprise packages allow partial encryption of data (i.e. encryption of only specific values or virtual tables). See the following documents for detailed API information:

*   [Value Level Encryption (VLE) Functions](https://www.zetetic.net/sqlcipher/value-level-encryption/)
*   [Encrypted Virtual Tables](https://www.zetetic.net/sqlcipher/encrypted-virtual-tables/)

### [sqlcipher\_perf\_\*()](#sqlcipher_perf)

SQLCipher Commercial and Enterprise packages contain a special extension which provides a way to benchmark performance characteristics of queries and statements exposed with two exposed SQL Functions:

*   `sqlcipher_perf_setup()` - creates the configuration table for the benchmarking system
*   `sqlcipher_perf_test()` - times each execution, collects performance statistics, and stores them a results table for analysis

Full documentation for this feature is [available here](https://www.zetetic.net/sqlcipher/sqlcipher-perf/).

[Changing The Key](#Changing_Key)
---------------------------------

### [PRAGMA rekey](#rekey)

To change the key on an existing encrypted database, it must first be unlocked with the current encryption key. Once the database is readable and writeable, `PRAGMA rekey` can be used to re-encrypt every page in the database with a new key.

#### [Example](#example-rekey)

    sqlite> PRAGMA key = 'old passphrase';
    sqlite> PRAGMA rekey = 'new passphrase';
    

#### [Implementation Notes](#notes-rekey)

*   `PRAGMA rekey` must be called after `PRAGMA key` . It can be called at any time once the database is readable.
*   `PRAGMA rekey` can not be used to encrypted a standard SQLite database! It is only useful for changing the key on an existing database. Instead, use [sqlcipher\_export()](https://www.zetetic.net/sqlcipher/sqlcipher-api/index.html#sqlcipher_export) to encrypt a plaintext database.

### [sqlite3\_rekey() sqlite3\_rekey\_v2()](#sqlite3_rekey)

It is possible to change the key used to encrypt a database programmatically without invoking the SQL `PRAGMA rekey` interface. sqlite3\_rekey() is actually called internally by the PRAGMA interface. The sqlite3\_rekey\_v2 call performs the same way as sqlite3\_rekey, but changes the key on a named database instead of the main database.

    int sqlite3_rekey(
      sqlite3 *db,                   /* Database to be rekeyed */
      const void *pKey, int nKey     /* The new key, and the length of the key in bytes */
    );
    int sqlite3_rekey_v2(
      sqlite3 *db,                   /* Database to be rekeyed */
      const char *zDbName,           /* Name of the database */
      const void *pKey, int nKey     /* The new key */
    );
    

[Key Options](#Key_Options)
---------------------------

Allocates a portion of the database header which will not be encrypted to allow identification as an SQLite database. The size must be greater than 0, a multiple of the cipher block size, and less than the usable size of the first database page. An example of setting the plain text header size is below:

    PRAGMA cipher_plaintext_header_size = 32;
    

This PRAGMA is primarily intended for use on iOS when a WAL mode database will be stored in a [shared container](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/ExtensionScenarios.html). In this special case iOS actually examines a database file to determine whether it is an SQLite database in WAL mode. If it is, then iOS extends [special privileges](https://developer.apple.com/library/content/technotes/tn2408/_index.html), allowing the application process to maintain a file lock on the main database while it is in the background. However, if iOS can’t determine the file type from the header because it contains random data like a SQLCipher database, then iOS will kill the application process when it attempts to background with a file lock.

In order to work around this issue, an iOS developer may provide instruction to SQLCipher to leave a portion of the database header unencrypted (plaintext). In this case SQLCipher will leave the specified number of bytes in the original SQLite file format and will only begin encrypting data after that. The recommended offset is currently 32 - this is small enough to ensure that sensitive information like schema and data are not exposed, but will ensure that the important [SQLite header](https://www.sqlite.org/fileformat.html) segments are readable by iOS, i.e. the magic “SQLite Format 3\\0” and the database read/write version numbers indicating a database is operating in WAL journal mode (offsets bytes 0 - 19). This will allow iOS to identify the file and will permit an application to background correctly without being killed.

It is important to note that SQLCipher normally stores the database salt (used for encryption and HMAC key derivation) in the first 16 bytes of the database file. When using `PRAGMA cipher_plaintext_header_size`, SQLCipher no longer has a place to store the salt, thus an application is responsible for managing it externally and providing it to SQLCipher. The related [PRAGMA cipher\_salt](#cipher_salt) allows an application to set and retrieve the salt programmatically. For instance, this can be used the first time a database is created to retrieve the randomly generated salt, so it can be stored away by the application (e.g. in the iOS Keychain, preferences, or a separate file). Then the next time a database is opened it can be used to provide the salt value back to SQLCipher in BLOB format (16 bytes, hex encoded):

    PRAGMA key = 'test';
    PRAGMA cipher_plaintext_header_size = 32;
    PRAGMA cipher_salt = "x'01010101010101010101010101010101'";
    

An alternate means of providing the salt is to use [raw key](#key) semantics. In this case, an application would provide 96 bytes hex encoded in BLOB format. The first 64 characters (32 bytes) will be used as the raw encryption key, and the remaining 32 characters (16 bytes) will be used as the salt:

    PRAGMA key = "x'98483C6EB40B6C31A448C22A66DED3B5E5E8D5119CAC8327B655C8B5C483648101010101010101010101010101010101'";
    

Note that `PRAGMA cipher_plaintext_header_size` must be called each time the database is opened and keyed. Likewise, the salt must be stored externally to the database by the application and provided for initialization every time the database is opened (with the possible exception of the first time a database is created).

It is possible to migrate a database with an encrypted header to plaintext, however, it requires a very specific set of operations. The application must make note and store off the existing database salt stored in the first 16 bytes of the databse. The database must first be opened normally and an operation must occur to cause the header to be read. Next, `PRAGMA cipher_plaintext_header_size` should be used to set the size of the plaintext segement. Finally, an operation must occur to cause the header to be immediately re-written using the new plaintext header size (the easiest way to do this is by calling `PRAGMA user_version` which updates the header). The following example demonstrates the migration process:

    sqlite> pragma key = 'test';
    ok
    sqlite> select count(*) from sqlite_master; -- trigger header read, currently it is encrypted
    1
    sqlite> PRAGMA cipher_salt; -- read current salt and save it for later use
    5062fa73375626a23af92d3dce504b57
    sqlite> PRAGMA cipher_plaintext_header_size = 32;
    sqlite> PRAGMA user_version = 1; -- force header write
    

After that the database can be closed and re-opened using `PRAGMA cipher_plaintext_header_size` and `PRAGMA cipher_salt`.

### [PRAGMA cipher\_salt](#cipher_salt)

Retrieve or set the salt value for the database. The format is a 32 character hex string which will be converted into 16 bytes. This PRAGMA allows an application to retrieve or set the database salt value programatically. When used without assigning a value, it will return a hex encoded string of 32 characters, representing the 16 byte salt. When used to set the salt, it should be provided a 32 character hex encoded string using BLOB formatting. An example of explicitly setting a database salt is below.

    PRAGMA cipher_salt = "x'01010101010101010101010101010101'";
    

Note that an application will not normally need to use this PRAGMA, as the salt is managed automatically by SQLCipher and stored in the first 16 bytes of the database file. This PRAGMA is should only be used in conjunction with [PRAGMA cipher\_plaintext\_header\_size](#cipher_plaintext_header_size).

### [PRAGMA kdf\_iter](#kdf_iter)

As previously noted, SQLCipher uses PBKDF2 key derivation to strengthen the key and make it resistent to brute force and dictionary attacks. The default configuration uses 256,000 PBKDF2 iterations (effectively 512,000 SHA512 operations). PRAGMA kdf\_iter can be used to increase or decrease the number of iterations used.

#### [Example](#example-kdf-iter)

    sqlite> PRAGMA key = 'blue valentines';
    sqlite> PRAGMA kdf_iter = '10000';
    

#### [Implementation Notes](#notes-kdf-iter)

*   `PRAGMA kdf_iter` must be called after `PRAGMA key` and before the first actual database operation or it will have no effect.
*   If a non-default value is used `PRAGMA kdf_iter` to create a database, it must also be called every time that database is opened.
*   We do not recommend reducing the number of iterations if a passphrase is in use.

### [PRAGMA cipher\_kdf\_algorithm](#cipher_kdf_algorithm)

Retrieve or set the KDF algorithm to be used. The default value is PBKDF2\_HMAC\_SHA512, however PBKDF2HMAC\_SHA256, and PBKDF2\_HMAC\_SHA1 are also supported. An example for utilizing an alternative KDF algorithm is below:

    PRAGMA cipher_kdf_algorithm = PBKDF2_HMAC_SHA256;
    

[Configuration (Encryption Settings)](#Configuration)
-----------------------------------------------------

### [PRAGMA cipher\_use\_hmac](#cipher_use_hmac)

SQLCipher 2.0 introduced a per-page HMAC to validate that the page data has not be tampered with. By default, when creating or opening a database using SQLCipher 2, SQLCipher will attempt to use an HMAC check. This change in database format means that SQLCipher 2 can’t operate on version 1.1.x databases by default. Thus, in order to provide backward compatibility with SQLCipher 1.1.x, `PRAGMA cipher_use_hmac` can be used to disable the HMAC functionality on specific databases.

#### [Example](#example-hmac)

    sqlite> PRAGMA key = 'blue valentines';
    sqlite> PRAGMA cipher_use_hmac = OFF;
    

#### [Implementation Notes](#notes-hmac)

*   `PRAGMA cipher_use_hmac` must be called immediately after `PRAGMA key` and before the first actual database operation or it will have no effect.
*   If a non-default value is used `PRAGMA cipher_use_hmac` to create a database, it must also be called every time that database is opened.

### [PRAGMA cipher\_memory\_security](#cipher_memory_security)

SQLCipher always performs internal locking and memory sanitization for internal allocations of cryptographic operations. Enabling `cipher_memory_security` will extend memory sanitization to all memory allocated by the library. Due to performance impact, this feature is disabled by default.

An example for enabling the memory wiping feature is below:

    PRAGMA cipher_memory_security = ON;
    

### [PRAGMA cipher\_add\_random](#cipher_add_random)

Add externally sourced entropy to the the entropy pool of the current crypto provider. The format of the data must be provided as a blob literal containing a hex sequence where the value is prefixed with an ‘x’ followed by a single quote, then the hex sequence, finally terminated with a single quote. Below is an example of adding additional entropy to the entropy pool:

    PRAGMA cipher_add_random = "x'deadbaad'";
    

[Migration and Compatibility](#Migrating_Databases)
---------------------------------------------------

### [PRAGMA cipher\_migrate](#cipher_migrate)

Major versions of SQLCipher have different default settings, and thus existing databases often need to be migrated or upgraded from older settings to a new version. PRAGMA cipher\_migrate aids in the conversion from an old SQLCipher database, given that default configurations were previously used during database creation.

Below shows an example of migrating a legacy SQLCipher database to the newest format. SQLCipher will upgrade the database in place:

    > ./sqlcipher 2xdatabase.db
    > PRAGMA key = 'YourKeyGoesHere';
    > PRAGMA cipher_migrate;
    

This PRAGMA will return a single row with the value 0 after successful completion of the migration process. The migrated database will remain open and use the same filename.

The `cipher_migrate` PRAGMA can upgrade standard SQLCipher version 1, 2, and 3 databases to the latest version. Note that if non-default settings, such as a different cipher or kdf\_iter were used in the original database, a manual migration would be required with the use of `sqlcipher_export`.

The `cipher_migrate` PRAGMA is potentially expensive because it needs to attempt to open the database for each version to determine the appropriate settings. Therefore an application should _NOT_ call the PRAGMA every time a database is opened. Instead, an application can use the following recommended process for opening and upgrading databases:

1.  Attempt to open and access the database as normal by keying the database and attempting a query
2.  If SQLCipher throws an error on first access, close the database handle. Then open it and run `PRAGMA cipher_migrate` (e.g. in the case of Android you can use the postKey hook). This will attempt to upgrade the database.
3.  Check the result of the update by retrieving the row value result.
4.  If the migration succeeds a row with a single column value of 0 is returned, the upgrade was successful and your application can continue to use the connection for the remainder of the application lifecycle.
5.  If the key is incorrect then the PRAGMA will return a single non-zero column value, meaning that the key material is incorrect or the settings of the database were not consistent with defaults for previous SQLCipher versions (i.e. custom settings were used that require manual migration).

This process performs optimally in the standard case when the database has already been migrated. It has a slight slowdown in the event that the key material is incorrect because the key may be derived multiple times to attempt migration, but that usually acceptable in most cases.

In the event that incorrect keys are a common situation, and thus the performance hit for migrating in step 2 is not acceptable, then the application should statefully tracking the current SQLCipher database version in an preference or through some other means.

**Note**: When opening a database connection to run `PRAGMA cipher_migrate`, it must be opened with flags allowing the connection to create a new database file. When using the C API or derivatives, pass `SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE` to `sqlite3_open_v2()`. On Android, pass `SQLiteDatabase.OPEN_READWRITE | SQLiteDatabase.CREATE_IF_NECESSARY` to `SQLiteDatabase.openDatabase()`. These flags wil allow the migration process to attach a new temporary database file for the update.

### [ATTACH](#attach)

It is possible to use a special `KEY` parameter to the ATTACH statement to specify that a database should be attached encrypted using a specific encryption key. This is very useful for copying and migrating data between databases.

#### [Example 1: Attach an Encrypted Database to a Plaintext Database](#example-1-attach-an-encrypted-database-to-a-plaintext-database)

    $ ./sqlcipher plaintext.db
    sqlite> ATTACH DATABASE 'encrypted.db' AS encrypted KEY 'testkey';
    

#### [Example 2: Attach an Encrypted Database using a Hex Key](#example-2-attach-an-encrypted-database-using-a-hex-key)

    $ ./sqlcipher plaintext.db
    sqlite> ATTACH DATABASE 'test2.db' AS db2 KEY "x'10483C6EB40B6C31A448C22A66DED3B5E5E8D5119CAC8327B655C8B5C4836481'";
    

#### [Example 3: Attach an Plaintext Database to an Encrypted Database](#example-3-attach-an-plaintext-database-to-an-encrypted-database)

    $ ./sqlcipher encrypted.db
    sqlite> ATTACH DATABASE 'plaintext.db' AS plaintext KEY ''; -- empty key will disable encryption
    

#### [Implementation Notes](#notes-attach)

*   If no `KEY` paramater is specified then the attached database will use the exact same raw key and database salt as the main database (or none if the main database is plaintext).
*   In practice, this means that calling applications should provide the key on the ATTACH parameter when opening any existing databases that may use a different salt.

### [sqlcipher\_export()](#sqlcipher_export)

`sqlcipher_export` is a convenience function that will duplicate the entire contents of the main database to an attached database including the schema, triggers, virtual tables, and all data. It’s primary function is to make it easy to migrate from a non-encrypted database to an encrypted database, from an encrypted database to a non-encrypted database, or between the various options of encrypted database supported by SQLCipher. For additional information and discussion on this subject please refer to this post on [how to encrypt a plaintext database using SQLCipher](https://discuss.zetetic.net/t/how-to-encrypt-a-plaintext-sqlite-database-to-use-sqlcipher-and-avoid-file-is-encrypted-or-is-not-a-database-errors/868)

To use sqlcipher\_export, simply call the function in a SELECT statement, passing in the name of the target database you want to write the source database schema and data to.

An optional second parameter can be used to provide the source database to use. If the second parameter is not provided, the default source is the main database. The second parameter can be used to copy from an attached database to the main database.

#### [Example 1: Encrypt a Plaintext Database](#example-1-encrypt-a-plaintext-database)

    $ ./sqlcipher plaintext.db
    sqlite> ATTACH DATABASE 'encrypted.db' AS encrypted KEY 'testkey';
    sqlite> SELECT sqlcipher_export('encrypted');
    sqlite> DETACH DATABASE encrypted;
    

#### [Example 2: Decrypt a SQLCipher database to a Plaintext Database](#example-2-decrypt-a-sqlcipher-database-to-a-plaintext-database)

    $ ./sqlcipher encrypted.db
    sqlite> PRAGMA key = 'testkey';
    sqlite> ATTACH DATABASE 'plaintext.db' AS plaintext KEY '';  -- empty key will disable encryption
    sqlite> SELECT sqlcipher_export('plaintext');
    sqlite> DETACH DATABASE plaintext;
    

#### [Example 3: Convert from a 3.x to 4.x Database](#example-3-convert-from-a-3-x-to-4-x-database)

    $ ./sqlcipher 1.1.x.db
    sqlite> PRAGMA key = 'testkey';
    sqlite> PRAGMA cipher_page_size = 1024;
    sqlite> PRAGMA kdf_iter = 64000;
    sqlite> PRAGMA cipher_hmac_algorithm = HMAC_SHA1;
    sqlite> PRAGMA cipher_kdf_algorithm = PBKDF2_HMAC_SHA1;
    sqlite> ATTACH DATABASE 'sqlcipher-4.db' AS sqlcipher4 KEY 'testkey';
    sqlite> SELECT sqlcipher_export('sqlcipher4');
    sqlite> DETACH DATABASE sqlcipher4;
    

#### [Example 4: Changing Cipher Settings](#example-4-changing-cipher-settings)

    $ ./sqlcipher encrypted.db
    sqlite> PRAGMA key = 'testkey';
    sqlite> ATTACH DATABASE 'newdb.db' AS newdb KEY 'newkey';
    sqlite> PRAGMA newdb.cipher_page_size = 4096;
    sqlite> PRAGMA newdb.cipher = 'aes-256-cfb';
    sqlite> PRAGMA newdb.kdf_iter = 10000;
    sqlite> SELECT sqlcipher_export('newdb');
    sqlite> DETACH DATABASE newdb;
    

#### [Example 5: Copying an attached plaintext database to a new empty encrypted main database](#example-5-copying-an-attached-plaintext-database-to-a-new-empty-encrypted-main-database)

    $ ./sqlcipher encrypted.db
    sqlite> PRAGMA key = 'testkey';
    sqlite> ATTACH DATABASE 'plain.db' AS plain KEY '';
    sqlite> SELECT sqlcipher_export('main', 'plain');
    sqlite> DETACH DATABASE plain;
    

#### [Implementation Notes:](#notes-export)

*   `sqlcipher_export` does not alter the `user_version` of the target database. Applications are free to do this themselves.

### [PRAGMA cipher\_compatibility](#cipher_compatibility)

Calling this PRAGMA and passing in 1, 2, 3, or 4 will cause SQLCipher to operate with default settings consistent with that major version number for the current connection, e.g. the following will cause SQLCipher to treat the current database as a SQLCipher 3.x database

    PRAGMA cipher_compatibility = 3;
    

[Performance](#Performance)
---------------------------

### [PRAGMA cipher\_page\_size](#cipher_page_size)

SQLCipher 2 introduced the new `PRAGMA cipher_page_size` that can be used to adjust the page size for the encrypted database. The default page size is 4096 bytes, but it can be desirable for some applications to use a larger page size for increased performance. For instance, some recent testing shows that increasing the page size can noticeably improve performance (5-30%) for certain queries that manipulate a large number of pages (e.g. selects without an index, large inserts in a transaction, big deletes).

To adjust the page size, call the pragma immediately after setting the key for the first time and each subsequent time that you open the database. The value for `cipher_page_size` must be a power of two between 512 and 65536 inclusive.

#### [Example](#example-page-size)

    sqlite> PRAGMA KEY = 'testkey';
    sqlite> PRAGMA cipher_page_size = 8192;
    

#### [Implementation Notes](#notes-page-size)

*   `PRAGMA cipher_page_size` must be called after `PRAGMA key` and before the first actual database operation or it will have no effect.
*   If a non-default value is used `PRAGMA cipher_page_size` to create a database, it must also be called every time that database is opened.

### [PRAGMA cipher\_profile](#cipher_profile)

The PRAGMA cipher\_profile command allows for profiling queries and their respective execution time in milliseconds. The command can accept five values: `stdout`, `stderr`, `device` (which will output with `logcat` for Android, and console via `os_log` on iOS/macOS), a file name of your choosing, or `off` to terminate profile capture. An example of the usage:

    $ ./sqlcipher example.db
    sqlite> PRAGMA cipher_profile='sqlcipher.log';
    sqlite> CREATE TABLE t1(a,b);
    sqlite> INSERT INTO t1(a,b) VALUES('one for the money', 'two for the show');
    sqlite> PRAGMA cipher_profile=off;
    

The above will generate a profile report representing the queries that were executed along with their respective wall-clock timing.

### [PRAGMA cipher\_kdf\_cache](#cipher_kdf_cache)

The PRAGMA cipher\_kdf\_cache command allows for enabling or disabling the performance optimization to reduce duplicate key derivation operations. This optimization is only available in Commercial and Enterprise editions of SQLCipher, and is turned on by default. To disable it, and clear any existing KDF cache, execute:

    sqlite> PRAGMA cipher_kdf_cache = OFF;
    

[Utilities](#Utilities)
-----------------------

### [PRAGMA cipher\_settings](#cipher_settings)

Provides the current runtime settings used to configure the database connection.

### [PRAGMA cipher\_integrity\_check](#cipher_integrity_check)

Performs an independent verification of the database based on the HMAC stored with each page, providing a report of any invalid pages or errors. This PRAGMA operates without invoking any database-internal logic so the caller can verify the “envelope” of each page in the file. Pages identified as invalid were likely modified after they were written to permanent storage by SQLCipher. In order for this PRAGMA to work the database must have the HMAC setting enabled, and the provided key must be correct. The PRAGMA will return one row per error condition. If no results are returned then the database was found to be externally consistent.

    sqlite> pragma key = 'testkey';
    sqlite> pragma cipher_integrity_check;
    HMAC verification failed for page 4
    HMAC verification failed for page 9
    page 240 has an invalid size of 1 bytes
    

### [PRAGMA cipher\_hmac\_algorithm](#cipher_hmac_algorithm)

Retrieve or set the HMAC algorithm to be used. The default value is HMAC\_SHA512, however HMAC\_SHA256, and HMAC\_SHA1 are also supported. An example for utilizing an alternative HMAC algorithm is below:

    PRAGMA cipher_hmac_algorithm = HMAC_SHA256;
    

### [PRAGMA cipher\_provider](#cipher_provider)

Provides the name of the compiled crypto provider. The database must be keyed before requesting the name of the crypto provider.

### [PRAGMA cipher\_provider\_version](#cipher_provider_version)

Provides the version number provided from the compiled crypto provider. This value, if known, is available only after the database has been keyed.

### [PRAGMA cipher\_version](#cipher_version)

Returns the compiled SQLCipher version number as a string. An example of the usage:

    $ ./sqlcipher example.db
    sqlite> PRAGMA cipher_version;
    3.3.1
    

### [PRAGMA cipher\_log](#cipher_log)

Instructs SQLCipher to log internal debugging and operational information to the sepecified log target. Available targets are `stdout` (for Standard Output), `stderr` (for Standard Error), `device` (which will output with `logcat` for Android, and console via `os_log` on iOS/macOS ), or a file name. In the case of a file name, the file will be created if it does not exist, and appended to if it does exist. This pragma should be used in conjunction with `PRAGMA cipher_log_level` in order to set the types of log messages that will be output. An example of the usage follows:

    $ ./sqlcipher example.db
    sqlite> PRAGMA key = 'test';
    sqlite> PRAGMA cipher_log = stderr;
    0
    sqlite> PRAGMA cipher_log_level = WARN;
    2
    

### [PRAGMA cipher\_log\_level](#cipher_log_level)

This PRAGMA selects the log level to use for internal logging. The available options are `NONE`, `ERROR`, `WARN`, `INFO`, `DEBUG`, and `TRACE`. Note that each level is more verbose than the last, and particularly with `DEBUG` and `TRACE` the logging system will generate a significant log volume. Using `NONE` will disable log output. This pragma should be used in conjunction with `PRAGMA cipher_log` to set the output target for log messages. An example of the usage follows:

    sqlite> pragma cipher_log = stderr;
    0
    sqlite> pragma cipher_log_level = DEBUG;
    8
    sqlite> pragma key = 'test';
    2022-03-03 09:43:59.684: sqlite3_key_v2: db=0x55fd1259e4d0 zDb=(null)
    2022-03-03 09:43:59.684: sqlite3CodecAttach: db=0x55fd1259e4d0, nDb=0
    2022-03-03 09:43:59.684: sqlite3CodecAttach: calling sqlcipher_activate()
    2022-03-03 09:43:59.684: sqlcipher_activate: calling sqlcipher_register_provider(0x55fd12629590)
    2022-03-03 09:43:59.684: sqlcipher_activate: called sqlcipher_register_provider(0x55fd12629590)
    2022-03-03 09:43:59.684: sqlite3CodecAttach: calling sqlcipher_codec_ctx_init()
    ...
    

### [PRAGMA cipher\_log\_source](#cipher_log_source)

`PRAGMA cipher_log_source` can be used to filter log output on higher verbosity levels by specifying a log source of `NONE`, `CORE`, `MEMORY`, `MUTEX`, `PROVIDER`, or `ANY`. This way applications can tune exactly which types of messages should be logged in the context of TRACE and DEBUG level logging where the volume of log messages is very high.

The default log source is `ANY`. An application can reset this by setting `PRAGMA cipher_log_source = 'NONE'` followed by one or more additional log sources. Each additional PRAGMA call will add the specified source. For example, the following sequence will enable logging of `CORE` and `PROVIDER` messages, but leave out `MUTEX` and `MEMORY`.

    sqlite> pragma cipher_log = stderr;
    sqlite> pragma cipher_log_level = DEBUG;
    sqlite> pragma cipher_log_source = NONE;
    sqlite> pragma cipher_log_source = CORE;
    sqlite> pragma cipher_log_source = PROVIDER;
    

[Default PRAGMA's](#Default_PRAGMAs)
------------------------------------

### [PRAGMA cipher\_default\_kdf\_iter](#cipher_default_kdf_iter)

In some very specific cases, it is not possible to call `PRAGMA kdf_iter` as one of the first operations on a database. An example of this is when you want to apply a global default for all database operations, or when trying to ATTACH an older database to the main database. In these cases `PRAGMA cipher_default_kdf_iter` can be used to globally alter the _default_ number of PBKDF2 iterations used when opening a database.

#### [Example](#example-default-kdf-iter)

    ./sqlcipher sqlcipher2.0.db
    sqlite> PRAGMA cipher_default_kdf_iter = 4000;
    sqlite> PRAGMA key = 's3cr37';
    

#### [Notes](#notes-default-kdf-iter)

*   `PRAGMA cipher_default_kdf_iter` can be called at any time, before or after opening a database. However, it’s setting will only take effect on the next database opened.

### [PRAGMA cipher\_default\_settings](#cipher_default_settings)

Provides the current “default” runtime settings used when attaching a database.

    PRAGMA cipher_default_settings;
    

### [PRAGMA cipher\_default\_compatibility](#cipher_default_compatibility)

Calling this PRAGMA and passing in 1, 2, 3, or 4 will cause SQLCipher to operate with the default settings consistent with that major version number as the default for the currently executing process (i.e. all connections opened after the statement executes). For example, the following will cause SQLCipher to treat all newly opened databases as a SQLCipher 2.x databases:

    PRAGMA cipher_default_compatibility = 2;
    

### [PRAGMA cipher\_default\_kdf\_algorithm](#cipher_default_kdf_algorithm)

Retrieve or set the KDF algorithm to be used when attaching a database. The default value is PBKDF2\_HMAC\_SHA512, however PBKDF2\_HMAC\_SHA256, and PBKDF2\_HMAC\_SHA1 are also supported. An example for utilizing an alternative KDF algorithm is below:

    PRAGMA cipher_default_kdf_algorithm = PBKDF2_HMAC_SHA256;
    

### [PRAGMA cipher\_default\_hmac\_algorithm](#cipher_default_hmac_algorithm)

Retrieve or set the HMAC algorithm to be used when attaching a database. The default value is HMAC\_SHA512, however HMAC\_SHA256, and HMAC\_SHA1 are also supported. An example for utilizing an alternative HMAC algorithm is below:

    PRAGMA cipher_default_hmac_algorithm = HMAC_SHA256;
    

Allocates a portion of the database header which will not be encrypted to allow identification as a SQLite database when attaching a database. The size must be greater than 0, a multiple of the cipher block size, and less than the usable size of the first database page. This behaves identically to [PRAGMA cipher\_plaintext\_header\_size](#cipher_plaintext_header_size) except that once the default is set, the value will be used for all subsequent SQLCipher operations. An example of setting the plain text header size is below:

    PRAGMA cipher_default_plaintext_header_size = 32;
    

### [PRAGMA cipher\_default\_page\_size](#cipher_default_page_size)

To attach a database that was generated with a non-default `cipher_page_size`, the `PRAGMA cipher_default_page_size` must be set in order to override the default page size during the attach phase. The value for `cipher_default_page_size` must be a power of two between 512 and 65536 inclusive.

#### [Example](#example-default-page-size)

    $ ./sqlcipher foo.db
    sqlite> PRAGMA key = 'foo';
    sqlite> PRAGMA cipher_page_size = 8192;
    sqlite> CREATE TABLE t1(a,b);
    sqlite> INSERT INTO t1(a,b) values('one for the money', 'two for the show');
    sqlite> .q
    
    $ ./sqlcipher bar.db
    sqlite> PRAGMA cipher_default_page_size = 8192;
    sqlite> PRAGMA key = 'bar';
    sqlite> ATTACH DATABASE 'foo.db' as foo KEY 'foo';
    sqlite> SELECT count(*) FROM foo.t1;
    

### [PRAGMA cipher\_default\_use\_hmac](#cipher_default_use_hmac)

In some very specific cases, it is not possible to call `PRAGMA cipher_use_hmac` as one of the first operations on a database. An example of this is when trying to ATTACH a 1.1.x database to the main database. In these cases `PRAGMA cipher_default_use_hmac` can be used to globally alter the _default_ use of HMAC when opening a database.

#### [Example](#example-default-hmac)

    ./sqlcipher sqlcipher2.0.db
    sqlite> PRAGMA key = 's3cr37'; -- opens using default setting, with HMAC on
    sqlite> PRAGMA cipher_default_use_hmac = OFF;
    sqlite> ATTACH DATABASE '1.1.x.db' AS remote key 's3cr37'; -- next open operation, the default for HMAC is off, and this database will be keyed with password 's3cr37'
    

#### [Implementation Notes](#notes-default-hmac)

*   `PRAGMA cipher_default_use_hmac` can be called at any time, before or after opening a database. However, it’s setting will only take effect on the next database opened.
*   See [this blog post](https://www.zetetic.net/blog/2012/3/1/pragma-cipher_default_use_hmac-off.html) for further details and usage examples