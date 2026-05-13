import traceback
import types


def execute_python_code(code, test_cases):

    results = []

    try:

        local_scope = {}

        # Execute user code
        exec(code, {}, local_scope)

        # Find first function safely
        function = None

        for value in local_scope.values():

            if isinstance(value, types.FunctionType):

                function = value
                break

        if function is None:

            return {
                "status": "ERROR",
                "results": [
                    {
                        "input": "",
                        "expected": "",
                        "got": "No function found",
                        "passed": False
                    }
                ]
            }

        overall_status = "CORRECT"

        # Run all test cases
        for test in test_cases:

            try:

                input_data = eval(test.input_data)

                expected_output = str(
                    test.expected_output
                )

                result = function(input_data)

                passed = (
                    str(result) ==
                    expected_output
                )

                if not passed:

                    overall_status = "WRONG"

                results.append({

                    "input":
                    test.input_data,

                    "expected":
                    expected_output,

                    "got":
                    str(result),

                    "passed":
                    passed
                })

            except Exception as e:

                overall_status = "ERROR"

                results.append({

                    "input":
                    test.input_data,

                    "expected":
                    test.expected_output,

                    "got":
                    str(e),

                    "passed":
                    False
                })

        return {

            "status":
            overall_status,

            "results":
            results
        }

    except Exception:

        return {

            "status":
            "ERROR",

            "results": [
                {
                    "input": "",
                    "expected": "",
                    "got": traceback.format_exc(),
                    "passed": False
                }
            ]
        }