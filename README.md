# splitter-component
Splitter component for the elastic.io platform

## Actions

### Split

Splits incoming message using splitting expression. Message has property body that contains object to split.
For example, we have our body that looks like this:
```
{
    "users": [
        {
            "name": "John"
        },
        {
            "name": "Mike"
        }
    ]
}
```
Our splitting expression is "users[*]". As the output of the component we'll have two objects:
```
{
    "users": {
        "name": "John"
    }
}

{
    "users": {
        "name": "Mike"
    }
}
```

Also component can split with more complicated expressions. For example, if we have splitting expression "users[\*].friends[*]" and our body looks like this:
```
{
    "users": [
        {
            "name": "John",
            "friends": [
                {
                    "name": "Michael"
                },
                {
                    "name": "Anna"
                }
            ]
        },
        {
            "name": "Mike",
            "friends": [
                {
                    "name": "George"
                },
                {
                    "name": "Monica"
                }
            ]
        }
    ]
}
```
As the output of the component we'll have four objects:
```
{
    "users": {
        "name": "John",
        "friends": {
            "name": "Michael"
        }
    }
}

{
    "users": {
        "name": "John",
        "friends": {
            "name": "Anna"
        }
    }
}

{
    "users": {
        "name": "Mike",
        "friends": {
            "name": "George"
        }
    }
}

{
    "users": {
        "name": "Mike",
        "friends": {
            "name": "Monica"
        }
    }
}
```
