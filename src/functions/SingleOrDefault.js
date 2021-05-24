/*=== SingleOrDefault Function from C# ====*/
SingleOrDefault = (arr, filter) => {
    let result = -1, found = 0

    for (let i = 0; i < arr.length; i++)
        if (filter(arr[i], i, arr)) {
            if (result === -1)
                result = i
            found++
        }

    return found === 1 ? result : null
}

module.exports = SingleOrDefault