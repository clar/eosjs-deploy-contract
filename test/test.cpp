#include "test.hpp"

ACTION test::sayhello(name user) {
  require_auth(user);
  print("Hello, ", name{user});
}
